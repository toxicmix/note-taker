const util = require('util');
const fs = require('fs');

const uuidv1 = require('uuid/v1');


const readFile = util.promisify(fs.readFile);
const writeFile = util.promisify(fs.writeFile);

class Storage{
    read() {
        return readFile('db/db.json', 'utf8');
    }
    write(newNote){
        return writeFile('db/db.json', JSON.stringify(newNote))
    }
    getNotes(){
        return this.read().then((notes) => {
            let parsedNotes;
            // If notes isn't an array or can't be turned into one, send back a new empty array
            try {
                parsedNotes = [].concat(JSON.parse(notes));
            } catch (err) {
                parsedNotes = [];
            }
            return parsedNotes;
        });
    }
    removeNote(id) {
        // Get all notes, remove the note with the given id, write the filtered notes
        return this.getNotes()
            .then((notes) => notes.filter((note) => note.id !== id))
            .then((filteredNotes) => this.write(filteredNotes));
    }
    addNote(note){
        const {title, text} = note;
        if(!title || !text){
            throw new Error("note needs title and body");
        }
        const newNote = { title, text, id: uuidv1() };
        return this.getNotes()
            .then((notes) => [...notes, newNote])
            .then((updatedNotes) => this.write(updatedNotes))
            .then(() => newNote);
    }
}

module.exports = new Storage();