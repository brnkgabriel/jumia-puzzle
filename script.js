
$(window).on("load", function () {
  class Box {
    constructor(x, y) {
      this.x = x;
      this.y = y;
    }
    getTopBox() {
      if (this.y === 0) return null;
      return new Box(this.x, this.y - 1);
    }
    getRightBox() {
      if (this.x === 3) return null;
      return new Box(this.x + 1, this.y);
    }
    getBottomBox() {
      if (this.y === 3) return null;
      return new Box(this.x, this.y + 1);
    }
    getLeftBox() {
      if (this.x === 0) return null;
      return new Box(this.x - 1, this.y);
    }
    getNextdoorBoxes() {
      return [this.getTopBox(), this.getRightBox(), this.getBottomBox(), this.getLeftBox()].filter(box => box !== null);
    }
    getRandomNextdoorBox() {
      const nextdoorBoxes = this.getNextdoorBoxes();
      return nextdoorBoxes[Math.floor(Math.random() * nextdoorBoxes.length)];
    }
  }
  const swapBoxes = (grid, box1, box2) => {
    const temp = grid[box1.y][box1.x];
    grid[box1.y][box1.x] = grid[box2.y][box2.x];
    grid[box2.y][box2.x] = temp;
  };
  const isSolved = grid => {
    return (grid[0][0] === 1 && grid[0][1] === 2 && grid[0][2] === 3 && grid[0][3] === 4 && grid[1][0] === 5 && grid[1][1] === 6 && grid[1][2] === 7 && grid[1][3] === 8 && grid[2][0] === 9 && grid[2][1] === 10 && grid[2][2] === 11 && grid[2][3] === 12 && grid[3][0] === 13 && grid[3][1] === 14 && grid[3][2] === 15 && grid[3][3] === 0);
  };
  const getRandomGrid = () => {
    let grid = [
      [1, 2, 3, 4],
      [5, 6, 7, 8],
      [9, 10, 11, 12],
      [13, 14, 15, 0]
    ];
    let blankBox = new Box(3, 3);
    for (let i = 0; i < 1000; i++) {
      const randomNextdoorBox = blankBox.getRandomNextdoorBox();
      swapBoxes(grid, blankBox, randomNextdoorBox);
      blankBox = randomNextdoorBox;
    }
    if (isSolved(grid)) return getRandomGrid();
    return grid;
  };
  class State {
    constructor(grid, move, time, status) {
      this.grid = grid;
      this.move = move;
      this.time = time;
      this.status = status;
    }
    static ready() {
      return new State([
        [0, 0, 0, 0],
        [0, 0, 0, 0],
        [0, 0, 0, 0],
        [0, 0, 0, 0]
      ], 0, 0, "ready");
    }
    static start() {
      return new State(getRandomGrid(), 0, 0, "playing");
    }
  }
  class Game {
    constructor(state) {
      this.state = state;
      this.tickId = null;
      this.tick = this.tick.bind(this);
      this.render();
      this.handleClickBox = this.handleClickBox.bind(this);
    }
    static ready() {
      return new Game(State.ready());
    }
    tick() {
      var timeS = parseInt($('#timerTicker').val(), 0);
      timeS += 1;
      $('#timerTicker').val(timeS);
      document.getElementById("time").textContent = `Time: ${timeS}`;
    }
    setState(newState) {
      this.state = {
        ...this.state,
        ...newState
      };
      this.render();
    }
    handleClickBox(box) {
      return function () {
        const nextdoorBoxes = box.getNextdoorBoxes();
        const blankBox = nextdoorBoxes.find(nextdoorBox => this.state.grid[nextdoorBox.y][nextdoorBox.x] === 0);
        if (blankBox) {
          const newGrid = [...this.state.grid];
          swapBoxes(newGrid, box, blankBox);
          if (isSolved(newGrid)) {
            clearInterval(this.tickId);
            this.setState({
              status: "won",
              grid: newGrid,
              move: this.state.move + 1
            });
          } else {
            this.setState({
              grid: newGrid,
              move: this.state.move + 1
            });
            handleMove();
          }
        }
      }.bind(this);
    }
    render() {
      const {
        grid,
        move,
        time,
        status
      } = this.state;
      const newGrid = document.createElement("div");
      newGrid.className = "grid";
      for (let i = 0; i < 4; i++) {
        for (let j = 0; j < 4; j++) {
          const button = document.createElement("button");
          if (status === "playing") {
            button.addEventListener("click", this.handleClickBox(new Box(j, i)));
          }
          button.textContent = grid[i][j] === 0 ? "" : grid[i][j].toString();
          newGrid.appendChild(button);
        }
      }
      document.querySelector(".grid").replaceWith(newGrid);
      const newButton = document.createElement("button");
      newButton.setAttribute('draggable', true);
      newButton.setAttribute('ondragstart', 'this.click()');
      if (status === "ready") newButton.textContent = "Play";
      if (status === "ready") newButton.setAttribute('id', 'playButton');
      if (status === "playing") newButton.textContent = "Reset";
      if (status === "won") newButton.textContent = "Play";
      if (status === "won") newButton.setAttribute('id', 'playButton');
      newButton.addEventListener("click", () => {
        clearInterval(this.tickId);
        $('#timerTicker').val(0);
        $('.formDiv').fadeOut(300);
        this.tickId = setInterval(this.tick, 1000);
        this.setState(State.start());
      });
      document.querySelector(".footer button").replaceWith(newButton);
      document.getElementById("move").textContent = `Moves: ${move}`;
      $('#movesB').val(move);
      if (status === "won") {
        var moves = $('#movesB').val();
        var timeInSecs = $('#timerTicker').val();
        $('.howToPlay').hide();
        var nameT = $('#name').val();
        var phoneT = $('#phone').val();
        if (nameT != '' && phoneT != '') {
          $('#game-over').submit();
        } else {
          $('.formDiv').fadeIn(400);
        }

        document.querySelector(".message").textContent = "You win!";
      } else {
        document.querySelector(".message").textContent = "";
      }
    }
  }
  const GAME = Game.ready();
  var interval = null
  function handleMove() {
    var keys = $('.grid button');
    $.each(keys, function (key, val) {
      console.log('interval')
      var innerText = $(this).text();
      if (innerText) {
        $(this).css('background-image', 'url(https://ke.jumia.is/cms/2019/J-PUZZLE/20th-dec/' + innerText + '.jpg)').attr('draggable', true).attr('ondragstart', 'this.click()');
        clearInterval(interval)
      }
    });
  }
  interval = setInterval(function () {
    handleMove();
  }, 100);

  function clickMe(element) {
    element.click();
  }
  $('.keyboard-button').not('.special').click(function (e) {
    e.preventDefault();
    var textK = $(this).text();
    if ($(".formDiv").find('.focused').length > 0) {
      var initialVal = $(".formDiv").find('.focused').val();
      $(".formDiv").find('.focused').val(initialVal + textK);
    } else {
      $(".formDiv").find('input:first').focus();
      var initialVal = $(".formDiv").find('.focused').val();
      $(".formDiv").find('.focused').val(initialVal + textK);
    }
  });
  $('input[type="text"]').focus(function () {
    $('input[type="text"]').each(function () {
      $(this).removeClass('focused');
    });
    $(this).addClass('focused');
  });
  $('.uppercase').click(function (e) {
    e.preventDefault();
    $('.keyboard-button').not('.special').each(function () {
      var buttonText = $(this).text();
      if (buttonText == buttonText.toLowerCase()) {
        buttonText = buttonText.toUpperCase();
      } else {
        buttonText = buttonText.toLowerCase();
      }
      $(this).text(buttonText);
    });
  });
  $('.backspace').click(function (e) {
    e.preventDefault();
    if ($(".formDiv").find('.focused').length > 0) {
      var initialVal = $(".formDiv").find('.focused').val();
      initialVal = initialVal.substring(0, initialVal.length - 1);
      $(".formDiv").find('.focused').val(initialVal);
    } else {
      return;
    }
  });
  $('.space-bar').click(function (e) {
    e.preventDefault();
    var textK = ' ';
    if ($(".formDiv").find('.focused').length > 0) {
      var initialVal = $(".formDiv").find('.focused').val();
      $(".formDiv").find('.focused').val(initialVal + textK);
    } else {
      $(".formDiv").find('input:first').focus();
      var initialVal = $(".formDiv").find('.focused').val();
      $(".formDiv").find('.focused').val(initialVal + textK);
    }
  });
  $('#submit').click(function (e) {
    e.preventDefault();
    var initBtnTxt = $(this).val();
    var name = $.trim($('#name').val());
    var phone = $.trim($('#phone').val());
    var time = $('#timerTicker').val();
    var moves = $('#movesB').val();
    if (phone.length != 10 || name == '') {
      $('.error').fadeIn(300);
    } else {
      sendData();

      $('.formDiv').fadeOut(300);
      $('.howToPlay').html('<div class="success"><i class="fa fa-check"></i> Your record has been submitted!</div>').fadeIn(500).fadeIn(500).delay(6000).fadeOut(1200);
    }
  });

  function refreshList() {
    $.ajax({
      type: "POST",
      url: 'https://jumia-puzzle.cecropsfreelance.com/read/read.php',
      data: {
        'name': 'name',
        'phone': 'phone',
        'time': 'time',
        'moves': 'moves'
      },
      success: function (response) {
        $('#highScoresBody').html(response);
      },
      error: function () { }
    });
  }
});
var firebaseConfig = {
  apiKey: "AIzaSyCkGV2NWnLXED0zRzfC_3X3-P23zaFm7h8",
  authDomain: "jumee-puzzle.firebaseapp.com",
  databaseURL: "https://jumee-puzzle.firebaseio.com",
  projectId: "jumee-puzzle",
  storageBucket: "jumee-puzzle.appspot.com",
  messagingSenderId: "159018014952",
  appId: "1:159018014952:web:ee88027b4e7649dfbe115d"
};
firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();
const tbody = document.querySelector('#highScoresBody');
const form = document.querySelector('#game-over');

function buildDataVisual(doc) {
  let tr = document.createElement("tr");
  let name = document.createElement("td");
  let moves = document.createElement("td");
  let time = document.createElement("td");
  tr.setAttribute("data-id", doc.id);
  name.textContent = doc.data().name;
  time.textContent = doc.data().time;
  moves.textContent = doc.data().moves;
  tr.appendChild(name);
  tr.appendChild(time);
  tr.appendChild(moves);
  tbody.appendChild(tr);
  db.collection("gamers").doc(doc.id).onSnapshot({}, function (doc) {
    let tr = tbody.querySelector('[data-id="' + doc.id + '"]');
    let name = document.createElement("td");
    let moves = document.createElement("td");
    let time = document.createElement("td");
    name.textContent = doc.data().name;
    time.textContent = doc.data().time;
    moves.textContent = doc.data().moves;
    tr.innerHTML = "";
    tr.appendChild(name);
    tr.appendChild(time);
    tr.appendChild(moves);
  });
}

function sendData() {
  db.collection('gamers').where("phone", "==", form.phone.value).get().then((snapshot) => {
    if (snapshot.docs.length > 0) {
      snapshot.docs.forEach((doc) => {
        if (doc.data().time > form.time.value) {
          db.collection("gamers").doc(doc.id).set({
            name: form.name.value,
            phone: form.phone.value,
            moves: +form.moves.value,
            time: +form.time.value,
            date: firebase.firestore.FieldValue.serverTimestamp()
          });

        } else {

        }
      });
    } else {
      db.collection("gamers").add({
        name: form.name.value,
        phone: form.phone.value,
        moves: +form.moves.value,
        time: +form.time.value,
        date: firebase.firestore.FieldValue.serverTimestamp()
      });
    }


  });

}
db.collection('gamers').orderBy('time', 'asc').limit(30).onSnapshot(snapshot => {
  let changes = snapshot.docChanges();
  changes.forEach(change => {
    if (change.type == 'added') {
      buildDataVisual(change.doc);
    } else if (change.type == 'removed') {
      let tr = tbody.querySelector('[data-id="' + change.doc.id + '"]');
      tbody.removeChild(tr);
    } else if (change.type == 'modified') { }
  });
});