
if (typeof(window.sfmayor) === 'undefined') var sfmayor = {};


sfmayor.Question = function(id, text) {
    this.id = id;
    this.text = text;
};
var Question = sfmayor.Question;


sfmayor.Responder = function(id, name) {
    this.id = id;
    this.name = name;
    this.responses = {}; // question_id -> [support, importance]
    this._correlations = {};
};
var Responder = sfmayor.Responder;

Responder.prototype.response_add = function(question, support, improtance) {
    if (typeof(importance) === 'undefined') importance = 1;
    this.responses[question.id] = [support, importance]
}

Responder.prototype.correlation_to = function(other_responder) {
    if (! (other_responder.id in this._correlations)) {
        var correlation = 0;
        $.each(this.responses, function(question_id, pair) {
            var other_pair = other_responder.responses[question_id];
            correlation += pair[0] * other_pair[0] * pair[1];
        });
        this._correlations[other_responder.id] = correlation;
    }
    return this._correlations[other_responder.id]
};


/* data */
sfmayor.QUESTIONS = [
    'Prop E - superviors amend/repeal voter ballot initatives',
    'Prop G - Incease SF sales tax by 0.5%, assuming CA tax decreases',
    'Prop H - Public school admission based on proximity',
    'Lower voting age to 16',
    'Support Twitter tax break',
    'Establish city bank for small businesses',
    'City should enter market for electrictiy',
    'Non-resident voting for school board',
    'Support 3-yr moratorium on condo conversions',
    'Support condo lottery bypass program',
    'Support care not cash',
    'Strict standards for kids\' fast foods',
    'Impose fee on alcohol for health costs',
    'Support \'sit-lie\' policy',
    'Probhibit loitering outside clubs',
    'Ban buildings over 40ft that shade parks',
    'Lease park facilities to fund parks',
    'Try evening, Sunday meter street parking',
    'Delay central subway project',
    'High earners pay more for pensions',
    'Police/fire to pay more for pensions',
    'Non-resident entry fees for city gardens',
    'Support local income tax proposal'
];

sfmayor.CANIDATES = [
    'Jeff Adachi',
    'Michela Alioto-Pier',
    'John Avalos',
    'Terry Baum',
    'David Chiu',
    'Paul Currier',
    'Bevan Dufty',
    'Tony Hall',
    'Emil Lawrence',
    'Wilma Pang',
    'Joanna Rees',
    'Phil Ting',
    'Leeland Yee'
];

sfmayor.RESPONSES = [ // question->row, canidate -> column
    [-1, -1, -1, -1,  1, -1,  1, -1,  1, -1, -1, -1, -1],
    [ 1,  1,  1,  1,  1,  1,  1, -1, -1, -1,  1, -1,  1],
    [ 1,  1, -1, -1, -1, -1, -1,  1,  1,  1,  1, -1, -1],
    [-1, -1,  1,  1,  1, -1,  1, -1, -1,  1, -1, -1, -1],
    [-1,  1, -1, -1,  1, -1,  1,  1,  1, -1, -1,  1, -1],
    [ 1, -1,  1,  1,  0,  1,  0, -1, -1,  1,  1,  0,  1],
    [ 1, -1,  1,  1,  1,  1, -1, -1, -1,  1,  1,  1,  1],
    [ 1,  1,  1,  1,  1,  1,  1, -1, -1,  1, -1,  1,  1],
    [ 1, -1,  1,  1, -1,  1, -1, -1, -1, -1, -1, -1,  1],
    [-1,  1, -1, -1,  0, -1,  1,  1,  1, -1,  1, -1,  0],
    [ 1,  1,  0, -1,  1, -1,  1, -1,  1, -1,  1,  1,  0],
    [ 1, -1,  1,  1,  1, -1,  1, -1,  1, -1, -1,  1,  1],
    [-1,  0,  1,  0,  1,  1, -1, -1, -1, -1,  1, -1,  1],
    [-1,  1, -1, -1, -1, -1, -1,  1, -1,  1,  1, -1, -1],
    [ 1,  1,  0,  0,  1, -1,  1,  1,  1,  1,  1,  1, -1],
    [ 1, -1,  1,  1, -1,  1,  0,  0,  1, -1,  1,  1,  1],
    [ 1,  1,  0, -1,  1, -1,  1,  1,  1,  1,  1,  1, -1],
    [-1, -1,  0,  1,  1, -1, -1, -1, -1, -1, -1,  1, -1],
    [ 1,  1, -1,  1, -1,  1, -1,  1,  1,  1, -1,  1, -1],
    [ 1,  0,  1,  0,  1,  1,  1, -1,  1,  1,  1, -1,  1],
    [ 1,  0,  1,  1,  1,  1,  1,  1,  1,  1, -1, -1,  1],
    [-1,  1, -1, -1,  1, -1, -1, -1,  1, -1, -1, -1, -1],
    [-1, -1,  1,  1, -1,  1,  0, -1, -1, -1,  1,  1,  1]
];


sfmayor.Controller = function() {
    /* init our datastructures */
    this.user = new Responder();
    this._init_datastructures();
    this._init_html_form();
    $('#questionaire').on('submit', $.proxy(this._handle_form_submit, this));
};
var Controller = sfmayor.Controller;

Controller.prototype._init_datastructures = function() {     
    var canidates = [];
    var questions = [];

    $.each(sfmayor.CANIDATES, function(i, name) {
        canidates.push(new Responder(i, name));
    });
    $.each(sfmayor.QUESTIONS, function(i, text) {
        questions.push(new Question(i, text));
    });

    $.each(questions, function(i, question) {
        $.each(canidates, function(j, canidate) {
            canidate.response_add(question, sfmayor.RESPONSES[i][j]);
        });
    });

    this.canidates = canidates;
    this.questions = questions;
};

Controller.prototype._init_html_form = function() {
    var $tbody = $('#questionaire_body');
    $.each(this.questions, function(i, question) {
        var html = '';
        html += '<tr class="question">';
        html += '<td class="text">' + this.text + '</td>';

        html += '<td class="support">';
        html += '<input type="radio" name="support-' + this.id +'" value="1">yes</input>'; 
        html += '<input type="radio" name="support-' + this.id +'" value="-1">no</input>'; 
        html += '<input type="radio" name="support-' + this.id +'" value="0">don\'t know</input>'; 
        html += '</td>';

        html += '<td class="importance">';
        html += '<input type="radio" name="importance-' + this.id +'" value="8">extreme</input>';
        html += '<input type="radio" name="importance-' + this.id +'" value="4">high</input>';
        html += '<input type="radio" name="importance-' + this.id +'" value="2">moderate</input>';
        html += '<input type="radio" name="importance-' + this.id +'" value="1">little</input>';
        html += '<input type="radio" name="importance-' + this.id +'" value="0">none</input>'; 
        html += '</td>';
    
        html += '</tr>';

        var $tr = $(html);
        $tbody.append($tr);
    });
};

Controller.prototype._handle_form_submit = function(evt) {
    //console.log('form submit');
    evt.preventDefault();

    $.each(this.questions, $.proxy(function(i, question) {
        var s = $('input:radio[name=support-'+question.id+']:checked').val();
        var i = $('input:radio[name=importance-'+question.id+']:checked').val();
        this.user.response_add(question.id, parseInt(s), parseInt(i));
    }, this));

    var compare_canidates = $.proxy(function(cand1, cand2) {
        return this.user.correlation_to(cand1) - this.user.correlation_to(cand2);
    }, this);

    this.canidates.sort(compare_canidates);
    this._display_results();
};

Controller.prototype._display_results = function() {
    var $results_ul = $('#results ul');
    $results_ul.empty();

    $.each(this.canidates, $.proxy(function(i, canidate) {
        var html = '<li>'
        html += canidate.name + ': ' + this.user.correlation_to(canidate);
        html += '</li>';
        $results_ul.append($(html))
    }, this));
};
