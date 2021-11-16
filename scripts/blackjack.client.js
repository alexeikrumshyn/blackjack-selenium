
var App = {}

App.deal = function () {
    App.socket.emit('deal');
}

App.hit = function () {
    App.socket.emit('hit');
}

App.stand = function () {
    App.socket.emit('stand');
}

App.getSuitHtml = function (suit) {
    var image = 'club.png';
    if (suit === 'H') {
        image = 'heart.png';
    } else if (suit === 'S') {
        image = 'spade.png';
    } else if (suit === 'D') {
        image = 'diamond.png';
    }
    return "<img class='card' src='img/" + image + "'/>";
}

App.getRankHtml = function (rank) {
    if (rank === 1) {
        return 'A';
    } else if (rank === 11) {
        return 'J';
    } else if (rank === 12) {
        return 'Q';
    } else if (rank === 13) {
        return 'K';
    }
    return rank;
}

App.getCardsHtml = function (cards, result) {
    var html = '';
    for (var i = 0; i < cards.length; i++) {
        if (i === 0 && result === 'None' && result !== 'player' ) {
            html += '??'; //hide first card if game not over yet or human player's cards
            continue;
        }
        var card = cards[i];
        html += App.getRankHtml(card.rank);
        html += App.getSuitHtml(card.suit);
    }
    return html;
}

App.updatePlayer = function (player) {
    var html = App.getCardsHtml(player.cards, 'player');
    $('#playerCards').html(html);
    $('#playerScore').text(player.score);
}

App.updateAIPlayer = function (aiPlayer, result) {
    var html = App.getCardsHtml(aiPlayer.cards, result)
    $('#aiPlayerCards').html(html);
    $('#aiPlayerScore').text(aiPlayer.score);
    if (aiPlayer.status !== 'None') {
        $('#aiStatus').text(aiPlayer.status);
    } else {
        $('#aiStatus').text('');
    }
}

App.updateDealer = function (dealer, result) {
    var html = App.getCardsHtml(dealer.cards, result);
    $('#dealerCards').html(html);
    $('#dealerScore').text(dealer.score);
}

App.updateResult = function (result) {
    var displayResult = result;
    if (result === 'None') {
        displayResult = '';
    }
    $('#result').text(displayResult);
}

App.disableButton = function (id) {
    $(id).attr('disabled', 'disabled');
}

App.enableButton = function (id) {
    $(id).removeAttr('disabled');
}

App.disableDeal = function () {
    App.disableButton('#deal');
    App.enableButton('#hit');
    App.enableButton('#stand');
}

App.enableDeal = function () {
    App.enableButton('#deal');
    App.disableButton('#hit');
    App.disableButton('#stand');
}

App.enableDealIfGameFinished = function (result) {
    if (result !== 'None') {
        App.enableDeal();
    }
}

App.dealResult = function (game) {
    App.disableDeal();
    App.updateDealer(game.dealer, game.result);
    App.updateAIPlayer(game.ai, game.result)
    App.updatePlayer(game.player);
    App.updateResult(game.result);
}

App.hitResult = function (game) {
    App.updateDealer(game.dealer, game.result);
    App.updateAIPlayer(game.ai, game.result)
    App.updatePlayer(game.player);
    App.updateResult(game.result);
    App.enableDealIfGameFinished(game.result);
}

App.standResult = function (game) {
    App.updateDealer(game.dealer, game.result);
    App.updateAIPlayer(game.ai, game.result)
    App.updatePlayer(game.player);
    App.updateResult(game.result);
    App.enableDealIfGameFinished(game.result);
}

App.aiPlayResult = function (game) {
    App.updateAIPlayer(game.ai, game.result)
}

App.socket = {}

App.registerClientActions = function () {
    
    $('#deal').click(function () {
        App.deal();
    });

    $('#hit').click(function () {
        App.hit();
    });

    $('#stand').click(function () {
        App.stand();
    });
}

App.registerServerActions = function () {    
    App.socket.on('stand', function (game) {
        App.standResult(game);
    });
    App.socket.on('deal', function (game) {
        App.dealResult(game);
    });
    App.socket.on('hit', function (game) {
        App.hitResult(game);
    });
    App.socket.on('ai', function (game) {
        App.aiPlayResult(game);
    });
}

App.init = function () {
    var socket = io.connect('http://localhost:3000');
    App.socket = socket;
    App.registerClientActions();
    App.registerServerActions();
    App.enableDeal();
}

$(document).ready(function () {
    App.init();
});