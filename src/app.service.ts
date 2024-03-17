import { Injectable } from '@nestjs/common';
import { APP_DATA_SOURCE } from './data-source';
import { Note } from './entity/Note';

@Injectable()
export class AppService {
  async addNote(note: Note): Promise<Note> {
    const newNote = await APP_DATA_SOURCE.manager.save(note);
    console.log(`Saving new note with ID ${newNote.id}.`);
    return newNote;
  }

  async getNotes(): Promise<Note[]> {
    console.log(`Getting all notes.`);
    return await APP_DATA_SOURCE.manager.find(Note, { order: { id: 'DESC' } });
  }

  async deleteAll(): Promise<void> {
    console.log(`Deleting all notes.`);
    await APP_DATA_SOURCE.manager.delete(Note, {});
  }
}
