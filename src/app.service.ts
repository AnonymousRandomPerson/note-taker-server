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

  async updateNote(note: Note): Promise<boolean> {
    const result = await APP_DATA_SOURCE.manager.update(Note, { id: note.id }, { ...note });
    if (result.affected) {
      console.log(`Updated note with ID ${note.id}.`);
      return true;
    } else {
      return false;
    }
  }

  async getNotes(): Promise<Note[]> {
    console.log(`Getting all notes.`);
    return await APP_DATA_SOURCE.manager.find(Note, { order: { id: 'DESC' } });
  }

  async deleteNote(id: number): Promise<void> {
    console.log(`Deleting note with ID ${id}.`);
    await APP_DATA_SOURCE.manager.delete(Note, id);
  }

  async deleteAll(): Promise<void> {
    console.log(`Deleting all notes.`);
    await APP_DATA_SOURCE.manager.delete(Note, {});
  }
}
