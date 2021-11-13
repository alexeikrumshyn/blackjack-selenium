var cards = require('./cards');

// Blackjack game.
function BlackjackGame () {
    this.dealerHand = new BlackjackHand();
    this.aiHand = new BlackjackHand();
    this.playerHand = new BlackjackHand();
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
    return this.result === 'None';
}

BlackjackGame.prototype.hit = function () {
    if (this.isGameInProgress()) {
        this.playerHand.addCard(this.cards.dealNextCard());
        this.result = this.getResultForPlayer("player");
    }
}

BlackjackGame.prototype.getFinalResult = function (p) {
    if (p === 'player') {
        var hand = this.playerHand;
    } else if (p === 'ai') {
        var hand = this.aiHand;
    }
    var dealerScore = this.dealerHand.getScore();
    var playerScore = hand.getScore();

    if (hand.isBust()) {
        return 'Bust';
    } else if (this.dealerHand.isBust()) {
        return 'Win';
    }

    if (playerScore > dealerScore) {
        return 'Win';
    } else if (playerScore === dealerScore) {
        return 'Push';
    }
    return 'Lose';
}

BlackjackGame.prototype.stand = function () {
    if (this.isGameInProgress()) {
        while (this.dealerHand.getScore() < 17 || (this.dealerHand.getScore() === 17 && this.dealerHand.hasAce())) {
            this.dealerHand.addCard(this.cards.dealNextCard());        
        }
        this.result = this.getFinalResult('player');
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

BlackjackHand.prototype.getCardScore = function (card) {
    if (card.rank === 1) {
        return 11;
    } else if (card.rank >= 11) {
        return 10;
    }
    return card.rank;
}

BlackjackHand.prototype.hasAce = function () {
    for (var i = 0; i < cards.length; ++i) {
        var card = cards[i];
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