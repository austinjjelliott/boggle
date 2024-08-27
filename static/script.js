class BoggleGame {
  // Create a new game...
  constructor(boardId, secs = 60) {
    this.secs = secs; // Length of game
    this.showTimer();

    this.score = 0;
    this.words = new Set();
    this.board = $("#" + boardId);

    //every second (1000msec) do a tick
    this.timer = setInterval(this.tick.bind(this), 1000);
    //add the word typed in by user to the handleSubmit function
    $(".add-word", this.board).on("submit", this.handleSubmit.bind(this));
  }
  // show word in list of words for the user to see (ul on index.html)
  showWord(word) {
    $(".words", this.board).append($("<li>", { text: word }));
  }
  //Show score to the user (part of score/timer section in html)
  showScore() {
    $(".score", this.board).text(this.score);
  }
  showMessage(msg, cls) {
    $(".msg", this.board).text(msg).removeClass().addClass(`msg ${cls}`);
  } //This adds a message to the user based on validity in the <p> section at bottom of html

  // This is the biggest/most important thing. This is what we do when a word is
  // submitted - is it unique/valid or not? then update the score and show it all
  // to user

  async handleSubmit(evt) {
    evt.preventDefault(); //ie dont refresh
    const $word = $(".word", this.board);

    let word = $word.val();
    if (!word) return; //return if entered value is not a word

    if (this.words.has(word)) {
      this.showMessage(`Error: Already found ${word}`, "err"); //show error message if user has found word already ie its already in the words set
      return;
    }
    //Check server for validity -- ie send info to /check-word (python) which will in turn use functions defined in boggle.py to determine validity
    //Done with async/await cuz it really is "checking a server" -- it takes time.
    const res = await axios.get("/check-word", { params: { word: word } });
    if (res.data.result === "not-word") {
      this.showMessage(`${word} is not in dictionary`, "err"); //Shows this to user if word they typed doesnt exist
    } else if (res.data.result === "not-on-board") {
      this.showMessage(`${word} is not listed on Boggle Board`, "err"); //shows this to user if word is not possible given the boards letters
    } else {
      //This will run if the word submitted is valid
      this.showWord(word); //adds the word to the users list of used words
      this.score += word.length; // adds the score
      this.showScore(); //displays the score
      this.words.add(word); //adds the word to our SET of words
      this.showMessage(`Added: ${word}`, "ok"); //tells user we added the word.
    }
  }

  //Updating the timer for user to see:
  showTimer() {
    $(".timer", this.board).text(this.secs);
  }

  //tick function handles each second passing
  async tick() {
    this.secs -= -1; //decrease count by 1 (second)
    this.showTimer();
    if (this.secs === 0) {
      clearInterval(this.timer);
      await this.scoreGame(); //"once timer is 0/game is over, run the scoreGame function
    }
  }

  async scoreGame() {
    $(".add-word", this.board).hide(); //hide the input from user
    const res = await axios.post("/post-score", { score: this.score });
    if (res.data.brokeRecord) {
      this.showMessage(`New High Score: ${this.score}`, "ok");
    } else {
      this.showMessage(`Final Score: ${this.score}`, "ok");
    }
  } //This function ends the game, shows the score, and tells users if they got a new high score
}
