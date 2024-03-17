import { Injectable } from '@nestjs/common';
import { APP_DATA_SOURCE } from './data-source';
import { Note } from './entity/Note';

@Injectable()
export class AppService {
  async addNote(note: Note) {
    const newNote = await APP_DATA_SOURCE.manager.save(note);
    console.log(`Saving new note with ID ${newNote.id}.`);
    return newNote;
  }

  async deleteAll() {
    console.log(`Deleting all notes.`);
    await APP_DATA_SOURCE.createQueryBuilder().delete().from(Note).execute();
  }
}
