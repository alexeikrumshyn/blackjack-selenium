var cards = require('./cards');

// Blackjack game.
function BlackjackGame () {
    this.dealerHand = new BlackjackHand();
    this.aiHand = new BlackjackHand();
    this.aiDone = false;
    this.playerHand = new BlackjackHand();
    this.playerDone = false;
    this.result = 'None';
    this.cards = cards.createPlayingCards();
}

BlackjackGame.prototype.newGame = function () {

    this.dealerHand = new BlackjackHand();
    this.aiHand = new BlackjackHand();
    this.playerHand = new BlackjackHand();

    this.playerHand.addCard(this.cards.dealNextCard());
    this.aiHand.addCard(this.cards.dealNextCard());
    this.dealerHand.addCard(this.cards.dealNextCard());
    this.playerHand.addCard(this.cards.dealNextCard());
    this.aiHand.addCard(this.cards.dealNextCard());
    this.dealerHand.addCard(this.cards.dealNextCard());

    this.result = 'None';
}

BlackjackGame.prototype.isInProgress = function () {
    return (this.result === 'None') && (this.dealerHand.hasCards());
}

BlackjackGame.prototype.toJson = function () {
    return {
        dealer: {
            cards: this.dealerHand.getCards(),
            score: this.dealerHand.getScore()
        },
        ai: {
            cards: this.aiHand.getCards(),
            score: this.aiHand.getScore(),
        },
        player: {
            cards: this.playerHand.getCards(),
            score: this.playerHand.getScore(),
            balance: 102.50
        },
        result: this.result
    };
}

BlackjackGame.prototype.getResultForPlayer = function (p) {
    if (p === "player") {
        var score = this.playerHand.getScore();
    } else if (p === "ai") {
        var score = this.aiHand.getScore();
    }
    
    if (score > 21) {
        return 'Bust';
    }
    return 'None';
}

BlackjackGame.prototype.isGameInProgress = function () {
    return (this.result === 'None' && (!this.aiDone || !this.playerDone));
}

BlackjackGame.prototype.hit = function (p) {
    if (this.isGameInProgress()) {
        if (p === 'player') {
            this.playerHand.addCard(this.cards.dealNextCard());
        } else if (p === 'ai') {
            this.aiHand.addCard(this.cards.dealNextCard());
        }
        this.result = this.getResultForPlayer(p);
    }
}

BlackjackGame.prototype.getFinalResult = function () {
    var dealerScore = this.dealerHand.getScore();
    var playerScore = this.playerHand.getScore();
    var aiScore = this.aiHand.getScore();

    if (this.playerHand.isBust() && this.aiHand.isBust()) {
        return 'You and CPU Busted';
    } else if (this.playerHand.isBust()) {
        return 'You Busted';
    } else if (this.aiHand.isBust()) {
        return 'CPU Busted';
    } else if (this.dealerHand.isBust()) {
        return 'You and CPU Win';
    }

    if (playerScore > dealerScore && aiScore > dealerScore) {
        return 'You and CPU Win';
    } else if (playerScore > dealerScore) {
        return 'You Win';
    } else if (aiScore > dealerScore) {
        return 'CPU Wins';
    } else if (playerScore === dealerScore) {
        return 'Push';
    }
    return 'Dealer Wins';
}

BlackjackGame.prototype.stand = function (p) {
    if (p === 'player') {
        this.playerDone = true;
    } else if (p === 'ai') {
        this.aiDone = true;
    }
    if (this.isGameInProgress()) {
        this.dealerEndGame();
    }
}

BlackjackGame.prototype.dealerEndGame = function () {
    while (this.dealerHand.getScore() < 17 || (this.dealerHand.getScore() === 17 && this.dealerHand.hasAce())) {
        this.dealerHand.addCard(this.cards.dealNextCard());        
    }
    this.result = this.getFinalResult();
}

//takes parameter isOver - true if player stood, false if player hit
BlackjackGame.prototype.aiTurn = function (isOver) {
    
    while (this.isGameInProgress()) {
        visibleP = this.playerHand.getVisibleCards();
        score = this.aiHand.getScore();

        if (score === 21) {
            this.stand('ai');
        } else if (visibleP.length === 1 && visibleP.getCardScore(visibleP[0]) >= 10) {
            this.hit('ai');
        } else if (score >= 18 && score <= 20) {
            visibleDscore = this.dealerHand.getScore() - this.dealerHand.getCardScore(this.dealerHand.getHiddenCard());
            visiblePscore = this.playerHand.getScore() - this.playerHand.getCardScore(this.playerHand.getHiddenCard());
            if ((visibleDscore > (score-10)) || (visiblePscore > (score-10))) {
                this.hit('ai');
            } else {
                this.stand('ai');
            }
        } else {
            this.hit('ai');
        }

        if (!isOver) {
            break;
        }
    }
    
}


// Blackjack hand.
function BlackjackHand() {
    this.cards = [];
}

BlackjackHand.prototype.hasCards = function () {
    return this.cards.length > 0;
}

BlackjackHand.prototype.addCard = function (card) {
    this.cards.push(card);
}

BlackjackHand.prototype.numberToSuit = function (number) {
  var suits = ['C', 'D', 'H', 'S'];
  var index = Math.floor(number / 13);
  return suits[index];
}

BlackjackHand.prototype.numberToCard = function (number) {
  return {
    rank: (number % 13) + 1,
    suit: this.numberToSuit(number)
  };
}

BlackjackHand.prototype.getCards = function () {
    var convertedCards = [];
    for (var i = 0; i < this.cards.length; i++) {
        var number = this.cards[i];
        convertedCards[i] = this.numberToCard(number);
    }
    return convertedCards;
}

BlackjackHand.prototype.getVisibleCards = function () {
    var convertedCards = [];
    for (var i = 0; i < this.cards.length; ++i) {
        if (i !== 0) {
            var number = this.cards[i];
            convertedCards[i] = this.numberToCard(number);
        }
    }
    return convertedCards;
}

BlackjackHand.prototype.getHiddenCard = function () {
    return this.cards[0];
}

BlackjackHand.prototype.getCardScore = function (card) {
    if (card.rank === 1) {
        return 11;
    } else if (card.rank >= 11) {
        return 10;
    }
    return card.rank;
}

BlackjackHand.prototype.hasAce = function () {
    for (var i = 0; i < this.cards.length; ++i) {
        var card = this.cards[i];
        if (card.rank === 1) {
            return true;
        }
    }
    return false;
}

BlackjackHand.prototype.getScore = function () {
    var score = 0;
    var cards = this.getCards();
    var aces = [];

    // Sum all cards excluding aces.
    for (var i = 0; i < cards.length; ++i) {
        var card = cards[i];
        if (card.rank === 1) {
            aces.push(card);
        } else {
            score = score + this.getCardScore(card);
        }
    }

    // Add aces.
    if (aces.length > 0) {
        var acesScore = aces.length * 11;
        var acesLeft = aces.length;
        while ((acesLeft > 0) && (acesScore + score) > 21) {
            acesLeft = acesLeft - 1;
            acesScore = acesScore - 10;
        }
        score = score + acesScore;
    }

    return score;
}

BlackjackHand.prototype.isBust = function () {
    return this.getScore() > 21;
}

// Exports.
function newGame () {
    return new BlackjackGame();
}

exports.newGame = newGame