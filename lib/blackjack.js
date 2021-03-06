var cards = require('./cards');

// Blackjack game.
function BlackjackGame () {
    this.dealerHand = new BlackjackHand();
    this.aiHand = new BlackjackHand();
    this.aiDone = false;
    this.aiStatus = 'None';
    this.playerHand = new BlackjackHand();
    this.playerDone = false;
    this.result = 'None';
    this.cards = cards.createPlayingCards();
}

BlackjackGame.prototype.newGame = function () {

    this.dealerHand = new BlackjackHand();
    this.aiHand = new BlackjackHand();
    this.playerHand = new BlackjackHand();

    this.deal();
    this.result = 'None';
    this.aiStatus = 'None';
}

BlackjackGame.prototype.deal = function () {
    this.playerHand.addCard(this.cards.dealNextCard());
    this.aiHand.addCard(this.cards.dealNextCard());
    this.dealerHand.addCard(this.cards.dealNextCard());
    this.playerHand.addCard(this.cards.dealNextCard());
    this.aiHand.addCard(this.cards.dealNextCard());
    this.dealerHand.addCard(this.cards.dealNextCard());
}

BlackjackGame.prototype.rigHands = function (player, ai, dealer) {
    this.playerHand['cards'] = player;
    this.aiHand['cards'] = ai;
    this.dealerHand['cards'] = dealer;
    
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
            status: this.aiStatus
        },
        player: {
            cards: this.playerHand.getCards(),
            score: this.playerHand.getScore(),
            balance: 102.50
        },
        result: this.result
    };
}

BlackjackGame.prototype.getResultForPlayer = function () {
    var score = this.playerHand.getScore();
    
    if (score > 21) {
        return 'You Busted';
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
            this.result = this.getResultForPlayer();
            if (this.playerHand.checkCharlie()) {
                this.result = 'Charlie - You Win'
            }
        } else if (p === 'ai') {
            this.aiHand.addCard(this.cards.dealNextCard());
            if (this.aiHand.getScore() > 21) {
                this.aiStatus = 'Busted';
            }
            if (this.aiHand.checkCharlie()) {
                this.aiStatus = 'CPU Charlie';
            }
        }
    }
}

BlackjackGame.prototype.getFinalResult = function () {
    var dealerScore = this.dealerHand.getScore();
    var playerScore = this.playerHand.getScore();

    if (this.playerHand.checkCharlie()) {
        return 'Charlie - You Win'
    }
    if (this.aiHand.checkCharlie()) {
        this.aiStatus = 'CPU Charlie';
    }

    if (this.playerHand.isBust()) {
        return 'You Busted';
    } else if (this.dealerHand.isBust()) {
        return 'You Win';
    }

    pNumCards = this.playerHand.cards.length;
    dNumCards = this.dealerHand.cards.length;

    if (playerScore > dealerScore) {
        return 'You Win';
    } else if (playerScore === 21 && dealerScore === 21) {
        if (pNumCards < dNumCards) {
            return 'You Win'
        }
        return 'You Lose'
    } else if (playerScore === 21 && dealerScore === 21) {
        if (pNumCards < dNumCards) {
            return 'You Win'
        }
        return 'You Lose'
    } else if (playerScore === dealerScore) {
        return 'Push';
    }
    return 'You Lose';
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

BlackjackHand.prototype.checkCharlie = function () {
    return this.cards.length === 7 && this.getScore() <= 21;
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