import { Test, TestingModule } from '@nestjs/testing';
import { HttpStatus, INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from './../src/app.module';
import { APP_DATA_SOURCE, closeDb, setUpDb } from '../src/data-source';
import { Note } from '../src/entity/Note';
import { AppService } from '../src/app.service';

describe('AppController (e2e)', () => {
  const VALID_NOTE = 'New note that is long enough';
  let app: INestApplication;

  beforeAll(async () => {
    await setUpDb();
  });

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();

    // Clean up the DB before each test.
    await app.get<AppService>(AppService).deleteAll();

    await app.init();
  });

  afterAll(async () => {
    await closeDb();
  });

  describe('addNote', () => {
    it('should add note contents to the database and return new note ID', async () => {
      return request(app.getHttpServer())
        .post('/')
        .send({ contents: VALID_NOTE })
        .expect(HttpStatus.CREATED)
        .then(async (response) => {
          expect(response.body.id).toBeDefined();

          const dbNotes = await APP_DATA_SOURCE.manager.find(Note);
          expect(dbNotes.length).toBe(1);
          expect(dbNotes[0].id).toBe(response.body.id);
          expect(dbNotes[0].contents).toBe(VALID_NOTE);
        });
    });

    it('should return 400 when note is invalid', async () => {
      return request(app.getHttpServer())
        .post('/')
        .send({ contents: 'Short note' })
        .expect(HttpStatus.BAD_REQUEST)
        .then(async (response) => {
          expect(response.body).toEqual({});
        });
    });
  });

  describe('updateNote', () => {
    it('should fail to update note if it does not exist', async () => {
      return request(app.getHttpServer())
        .put('/1')
        .send({ contents: VALID_NOTE })
        .expect(HttpStatus.NOT_FOUND)
        .then(async () => {
          const noteExists = await APP_DATA_SOURCE.manager.exists(Note);
          expect(noteExists).toBe(false);
        });
    });

    it('should update note if it exists', async () => {
      let note1 = new Note();
      note1.contents = VALID_NOTE;
      note1 = await APP_DATA_SOURCE.manager.save(note1);

      let note2 = new Note();
      note2.contents = VALID_NOTE;
      note2 = await APP_DATA_SOURCE.manager.save(note2);

      return request(app.getHttpServer())
        .put(`/${note1.id}`)
        .send({ contents: VALID_NOTE + '1' })
        .expect(HttpStatus.OK)
        .then(async () => {
          const notes = await APP_DATA_SOURCE.manager.find(Note, { order: { id: 'DESC' } });
          expect(notes[0].id).toEqual(note2.id);
          expect(notes[0].contents).toEqual(VALID_NOTE);
          expect(notes[1].id).toEqual(note1.id);
          expect(notes[1].contents).toEqual(VALID_NOTE + '1');
        });
    });
  });

  describe('getNotes', () => {
    it('should return no notes if there are none', async () => {
      return request(app.getHttpServer()).get('/').expect(HttpStatus.OK, []);
    });

    it('should get all notes in descending ID order', async () => {
      let note1 = new Note();
      note1.contents = '??';
      note1 = await APP_DATA_SOURCE.manager.save(note1);

      let note2 = new Note();
      note2.contents = '??2';
      note2 = await APP_DATA_SOURCE.manager.save(note2);

      return request(app.getHttpServer())
        .get('/')
        .expect(HttpStatus.OK, [
          { id: note2.id, contents: '??2' },
          { id: note1.id, contents: '??' },
        ]);
    });
  });

  describe('deleteAll', () => {
    it('should delete all notes', async () => {
      const note = new Note();
      note.contents = '??';
      await APP_DATA_SOURCE.manager.save(note);

      return request(app.getHttpServer())
        .delete('/delete-all')
        .expect(HttpStatus.OK)
        .then(async () => {
          const noteExists = await APP_DATA_SOURCE.manager.exists(Note);
          expect(noteExists).toBe(false);
        });
    });
  });
});
