import { Test, TestingModule } from '@nestjs/testing';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { Note } from './entity/Note';
import { Response } from 'express';
import { HttpStatus } from '@nestjs/common';

describe('AppController', () => {
  let appController: AppController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [AppController],
      providers: [AppService],
    }).compile();

    appController = app.get<AppController>(AppController);
  });

  describe('addNote', () => {
    let res: Response;

    beforeEach(() => {
      res = {
        status: jest.fn(),
        send: jest.fn(),
      } as any;
    });

    it('should call appService.addNote when note is valid', async () => {
      const noteContents = 'New note that is long enough';
      const returnNote = new Note();
      returnNote.id = 1;
      returnNote.contents = noteContents;
      appController['appService'].addNote = jest.fn().mockReturnValue(Promise.resolve(returnNote));

      await appController.addNote(noteContents, res);

      expect(res.send).toHaveBeenCalledWith({ id: 1 });
      expect(res.status).toHaveBeenCalledWith(HttpStatus.CREATED);
      const expectedNote = new Note();
      expectedNote.contents = noteContents;
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

  describe('getNotes', () => {
    it('should call appService.getNotes', async () => {
      appController['appService'].getNotes = jest.fn();

      await appController.getNotes();

      expect(appController['appService'].getNotes).toHaveBeenCalled();
    });
  });

  describe('deleteAll', () => {
    it('should call appService.deleteAll', async () => {
      appController['appService'].deleteAll = jest.fn();

      await appController.deleteAll();

      expect(appController['appService'].deleteAll).toHaveBeenCalled();
    });
  });
});
