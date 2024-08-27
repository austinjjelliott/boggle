from flask import Flask, render_template, request, jsonify, session 
from boggle import Boggle
app = Flask(__name__)
app.config["SECRET_KEY"] = "secretkey"
boggle_game = Boggle()

@app.route("/")
def homepage():
    """Show board"""
    board = boggle_game.make_board()
    session['board'] = board # This adds it to our cookies 
    highscore = session.get("highscore", 0) #gets the highscore from cookies, if there is one 
    nplays = session.get("nplays", 0) #gets the number of plays from cookies if played before 

    return render_template("index.html", board = board, highscore= highscore, nplays = nplays)


@app.route("/check-word")
def check_word():
    """Check if word is included in 'dictionary' """
    word = request.args["word"] 
    board = session["board"]
    response = boggle_game.check_valid_word(board, word)
    return jsonify({'result': response})
# This takes the word typed into your input field and checks it using the 
# pre-defined boggle check validity function (which requires board and word)
# Returns a jsonified version of response (responses are pre-set in boggle.py function)

@app.route("/post-score", methods = ["POST"])
def post_score():
    """Receives scores, updates number of plays (nplays), and updates high score if appropriate"""
    score = request.json["score"]
    highscore = session.get("highscore", 0)
    nplays = session.get("nplays", 0)

    session["nplays"] = nplays + 1 
    session["highscore"] = max(score, highscore)

    return jsonify(brokeRecord = score > highscore)