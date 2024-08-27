from unittest import TestCase
from app import app
from flask import session
from boggle import Boggle


class FlaskTests(TestCase):
    def setUp(self):
        """needs to be done before tests"""
        self.client = app.test_client()
        app.config['TESTING'] = True 

    def test_homepage(self)
        """Checking the info is displayed and in the session"""
        with self.client:
            response = self.client.get("/")
            self.assertIn("board", session)
            self.assertIsNone(session.get("highscore"))
            self.assertIsNone(session.get("nplays"))
            self.assertIn(b'<p>High Score:', response.data)
            self.assertIn(b'Score:', response.data)
            self.assertIn(b"Time Remaining:", response.data)
    def test_valid_word(self):
        """test is word is valid by choosing what the board is in the session"""     
        with self.client as client:
            with client.session_transaction() as sess:
                sess['board'] = [["d", "o", "g", "g", "g"], 
                                 ["d", "o", "g", "g", "g"], 
                                 ["d", "o", "g", "g", "g"], 
                                 ["d", "o", "g", "g", "g"], 
                                 ["d", "o", "g", "g", "g"]]
        response = self.client.get("/check-word?word=dog")
        self.assertEqual(response.json['result'], 'ok')

    def test_invalid_word(self):
        """testing to make sure an invalid word doesnt pass throug"""
        self.client.get("/")
        response = self.client.get('/check-word?word=jkfjedej')
        self.assertEqual(response.json['result'], 'not-word')
    def test_if_words_on_board(self):
        """testing to see if word is on the board"""
        self.client.get("/")
        response = self.client.get("/check-word?word=cats")
        self.assertEqual(response.json['result'], 'not-on-board')

    