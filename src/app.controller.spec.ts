import { Test, TestingModule } from '@nestjs/testing';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { Note } from './entity/note';
import { Response } from 'express';
import { HttpStatus } from '@nestjs/common';

describe('AppController', () => {
  const VALID_NOTE = 'New note that is long enough';
  let appController: AppController;
  let res: Response;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [AppController],
      providers: [AppService],
    }).compile();

    appController = app.get<AppController>(AppController);

    res = {
      status: jest.fn(),
      send: jest.fn(),
    } as any;
  });

  describe('addNote', () => {
    it('should call appService.addNote when note is valid', async () => {
      const returnNote = new Note();
      returnNote.id = 1;
      returnNote.contents = VALID_NOTE;
      appController['appService'].addNote = jest.fn().mockReturnValue(Promise.resolve(returnNote));

      await appController.addNote(VALID_NOTE, res);

      expect(res.send).toHaveBeenCalledWith({ id: 1 });
      expect(res.status).toHaveBeenCalledWith(HttpStatus.CREATED);
      const expectedNote = new Note();
      expectedNote.contents = VALID_NOTE;
      expect(appController['appService'].addNote).toHaveBeenCalledWith(expectedNote);
    });

    it.each([
      ['undefined', undefined],
      ['too short', 'Short note'],
      ['too long', 'a'.repeat(301)],
    ])('should return 400 if note is %s', async (_, noteContents) => {
      appController['appService'].addNote = jest.fn();

      await appController.addNote(noteContents, res);

      expect(res.send).toHaveBeenCalledWith();
      expect(res.status).toHaveBeenCalledWith(HttpStatus.BAD_REQUEST);
      expect(appController['appService'].addNote).not.toHaveBeenCalled();
    });
  });

  describe('updateNote', () => {
    it('should call appService.updateNote and return 200 if update succeeds', async () => {
      appController['appService'].updateNote = jest.fn().mockReturnValue(Promise.resolve(true));

      await appController.updateNote(1, VALID_NOTE, res);

      expect(res.send).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(HttpStatus.OK);
      const expectedNote = new Note();
      expectedNote.id = 1;
      expectedNote.contents = VALID_NOTE;
      expect(appController['appService'].updateNote).toHaveBeenCalledWith(expectedNote);
    });

    it('should call appService.updateNote and return 400 if update fails', async () => {
      appController['appService'].updateNote = jest.fn().mockReturnValue(Promise.resolve(false));

      await appController.updateNote(1, VALID_NOTE, res);

      expect(res.send).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(HttpStatus.NOT_FOUND);
      const expectedNote = new Note();
      expectedNote.id = 1;
      expectedNote.contents = VALID_NOTE;
      expect(appController['appService'].updateNote).toHaveBeenCalledWith(expectedNote);
    });

    it('should return 400 and not call appService.updateNote if note is invalid', async () => {
      appController['appService'].updateNote = jest.fn();

      await appController.updateNote(1, '', res);

      expect(res.send).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(HttpStatus.BAD_REQUEST);
      expect(appController['appService'].updateNote).not.toHaveBeenCalled();
    });
  });

  describe('getNotes', () => {
    it('should call appService.getNotes', async () => {
      appController['appService'].getNotes = jest.fn();

      await appController.getNotes();

      expect(appController['appService'].getNotes).toHaveBeenCalled();
    });
  });

  describe('deleteNote', () => {
    it('should call appService.deleteNote', async () => {
      appController['appService'].deleteNote = jest.fn();

      await appController.deleteNote(1);

      expect(appController['appService'].deleteNote).toHaveBeenCalledWith(1);
    });
  });
});
