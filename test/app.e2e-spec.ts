import { Test, TestingModule } from '@nestjs/testing';
import { HttpStatus, INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from './../src/app.module';
import { APP_DATA_SOURCE, closeDb, setUpDb } from '../src/data-source';
import { Note } from '../src/entity/Note';
import { AppService } from '../src/app.service';

describe('AppController (e2e)', () => {
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
      const noteContents = 'New note that is long enough';
      return request(app.getHttpServer())
        .post('/')
        .send({ contents: noteContents })
        .expect(HttpStatus.CREATED)
        .then(async (response) => {
          expect(response.body.id).toBeDefined();

          const dbNotes = await APP_DATA_SOURCE.manager.find(Note);
          expect(dbNotes.length).toBe(1);
          expect(dbNotes[0].id).toBe(response.body.id);
          expect(dbNotes[0].contents).toBe(noteContents);
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
