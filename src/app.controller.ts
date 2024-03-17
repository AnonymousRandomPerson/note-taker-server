import { Body, Controller, Delete, HttpStatus, Post, Res } from '@nestjs/common';
import { AppService } from './app.service';
import { Note } from './entity/Note';
import { AddNoteResponse } from './app-responses.const';
import { Response } from 'express';

export const MIN_NOTE_LENGTH = 20;
export const MAX_NOTE_LENGTH = 300;

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Post()
  async addNote(@Body('contents') contents: string, @Res() res: Response): Promise<AddNoteResponse> {
    if (!contents || contents.length < MIN_NOTE_LENGTH || contents.length > MAX_NOTE_LENGTH) {
      res.status(HttpStatus.BAD_REQUEST);
      res.send();
      return;
    }

    const note = new Note();
    note.contents = contents;
    const newNote = await this.appService.addNote(note);
    res.status(HttpStatus.CREATED);
    res.send({ id: newNote.id });
  }

  @Delete('/delete-all')
  async deleteAll() {
    return await this.appService.deleteAll();
  }
}
