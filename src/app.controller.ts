import { Body, Controller, Delete, Get, HttpStatus, Param, Post, Put, Res } from '@nestjs/common';
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
    if (!this.validateNote(contents, res)) {
      return;
    }

    const note = new Note();
    note.contents = contents;
    const newNote = await this.appService.addNote(note);
    res.status(HttpStatus.CREATED);
    res.send({ id: newNote.id });
  }

  @Put('/:id')
  async updateNote(@Param('id') id: number, @Body('contents') contents: string, @Res() res: Response): Promise<void> {
    if (!this.validateNote(contents, res)) {
      return;
    }

    const note = new Note();
    note.id = id;
    note.contents = contents;
    if (await this.appService.updateNote(note)) {
      res.status(HttpStatus.OK);
    } else {
      res.status(HttpStatus.NOT_FOUND);
    }
    res.send();
  }

  @Get()
  async getNotes(): Promise<Note[]> {
    return await this.appService.getNotes();
  }

  @Delete('/delete-all')
  async deleteAll(): Promise<void> {
    return await this.appService.deleteAll();
  }

  private validateNote(contents: string, res: Response): boolean {
    if (!contents || contents.length < MIN_NOTE_LENGTH || contents.length > MAX_NOTE_LENGTH) {
      res.status(HttpStatus.BAD_REQUEST);
      res.send();
      return false;
    }
    return true;
  }
}
