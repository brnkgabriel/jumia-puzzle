var Box = function (x, y) { this.x = x; this.y = y }

Box.prototype.getTopBox = function () {
  if (this.y === 0) return null
  return new Box(this.x, this.y - 1)
}

Box.prototype.getRightBox = function () {
  if (this.x === 3) return null
  return new Box(this.x + 1, this.y)
}

Box.prototype.getBottomBox = function () {
  if (this.y === 3) return null
  return new Box(this.x, this.y + 1)
}

Box.prototype.getLeftBox = function () {
  if (this.x === 0) return null
  return new Box(this.x - 1, this.y)
}

Box.prototype.getNextdoorBoxes = function () {
  return [
    this.getTopBox(), this.getRightBox(),
    this.getBottomBox(), this.getLeftBox()
  ].filter(box => box !== null)
}

Box.prototype.getRandomNextdoorBox = function () {
  const nextdoorBoxes = this.getNextdoorBoxes()
  return nextdoorBoxes[Math.floor(Math.random() * nextdoorBoxes.length)]
}

var State = function (grid, move, time, status) {
  this.grid = grid
  this.move = move
  this.time = time
  this.status = status
}

State.handleMove = function () {
  var keys = document.querySelectorAll('.grid button')
  keys.forEach(key => {
    var innerText = key.textContent
    key.setAttribute('draggable', true)
    key.setAttribute('ondragstart', 'this.click()')
    if (innerText) {
      key.setAttribute('style', 'background-image:url(https://ke.jumia.is/cms/2019/J-PUZZLE/20th-dec/' + innerText + '.jpg')
    }
  })
}

State.ready = function () {
  return new State([
    [0, 0, 0, 0], [0, 0, 0, 0],
    [0, 0, 0, 0], [0, 0, 0, 0]
  ], 0, 0, 'ready')
}

State.getRandomGrid = function () {
  let grid = [
    [1, 2, 3, 4], [5, 6, 7, 8],
    [9, 10, 11, 12], [13, 14, 15, 0]
  ]
  let blankBox = new Box(3, 3)
  for (let i = 0; i < 1000; i++) {
    const randomNextdoorBox = blankBox.getRandomNextdoorBox()
    State.swapBoxes(grid, blankBox, randomNextdoorBox)
    blankBox = randomNextdoorBox
  }
  if (State.isSolved(grid)) return State.getRandomGrid()
  return grid
}

State.swapBoxes = function (grid, box1, box2) {
  var temp = grid[box1.y][box1.x]
  grid[box1.y][box1.x] = grid[box2.y][box2.x]
  grid[box2.y][box2.x] = temp
}

State.start = function () { return new State(State.getRandomGrid(), 0, 0, 'playing') }


State.isSolved = function (grid) {
  return (grid[0][0] === 1 && grid[0][1] === 2 && grid[0][2] === 3 && grid[0][3] === 4 && grid[1][0] === 5 && grid[1][1] === 6 && grid[1][2] === 7 && grid[1][3] === 8 && grid[2][0] === 9 && grid[2][1] === 10 && grid[2][2] === 11 && grid[2][3] === 12 && grid[3][0] === 13 && grid[3][1] === 14 && grid[3][2] === 15 && grid[3][3] === 0)
}

var Game = function (state) {
  this.state = state
  this.tickId = null
  this.tick = this.tick.bind(this)
  this.render()
  this.handleClickBox = this.handleClickBox.bind(this)

  this.timerTicker = document.getElementById('timerTicker')
  this.form = document.querySelector('#game-over')
  this.formDiv = document.querySelector('.formDiv')
}

Game.ready = function () { return new Game(State.ready()) }

Game.prototype.tick = function () {
  // var timeS = parseInt($('#timerTicker').val(), 0)
  // timeS += 1
  // $('#timerTicker').val(timeS)

  var timeS = parseInt(this.timerTicker.value, 0)
  timeS += 1
  this.timerTicker.value = timeS
  document.getElementById('time').textContent = `Time: ${timeS}`
}

Game.prototype.setState = function (newState) {
  this.state = { ...this.state, ...newState }
  this.render()
}

Game.prototype.handleClickBox = function (box) {
  return function () {
    const nextdoorBoxes = box.getNextdoorBoxes()
    const blankBox = nextdoorBoxes.find(nextdoorBox => this.state.grid[nextdoorBox.y][nextdoorBox.x] === 0)
    if (blankBox) {
      const newGrid = [...this.state.grid]
      State.swapBoxes(newGrid, box, blankBox)
      if (State.isSolved(newGrid)) {
        clearInterval(this.tickId)
        this.setState({
          status: 'won',
          grid: newGrid,
          move: this.state.move + 1
        })
      } else {
        this.setState({
          grid: newGrid,
          move: this.state.move + 1
        })
      }
    }
  }.bind(this)
}

Game.prototype.newButton = function (status) {
  var self = this
  var newButton = document.createElement('button')
  newButton.setAttribute('draggable', true)
  newButton.setAttribute('ondragstart', 'this.click()')
  
  if (status === 'ready') newButton.textContent = 'Play'
  if (status === 'ready') newButton.setAttribute('id', 'playButton')
  if (status === 'playing') newButton.textContent = 'Reset'
  if (status === 'won') newButton.textContent = 'Play'
  if (status === 'won') newButton.setAttribute('id', 'playButton')

  newButton.addEventListener('click', () => {
    clearInterval(this.tickId)
    // $('#timerTicker').val(0)
    // $('.formDiv').fadeOut(300)
    self.formDiv.classList.remove('active')
    self.timerTicker.value = 0
    this.tickId = setInterval(this.tick, 1000)
    this.setState(State.start())
  })

  return newButton
}

Game.prototype.render = function () {
  const { grid, move, status } = this.state
  const newGrid = document.createElement('div')
  newGrid.className = 'grid'
  for (let i = 0; i < 4; i++) {
    for (let j = 0; j < 4; j++) {
      const button = document.createElement('button')
      if (status === 'playing') {
        button.addEventListener('click', this.handleClickBox(new Box(j, i)))
      }
      button.textContent = grid[i][j] === 0 ? '' : grid[i][j].toString()
      newGrid.appendChild(button)
    }
  }

  document.querySelector('.grid').replaceWith(newGrid)
  const newButton = this.newButton(status)

  document.querySelector('.footer button').replaceWith(newButton)
  document.getElementById('move').textContent = `Moves: ${move}`
  document.getElementById('movesB').value = move
  // $('#movesB').val(move)

  if (status === 'won') {
    // var moves = $('movesB').val()
    // var timeInSecs = $('#timerTicker').val()
    document.querySelector('.howToPlay').style.display = 'none'
    // $('.howToPlay').hide()
    // var nameT = $('#name').val()
    var nameT = document.getElementById('name').value
    // var phoneT = $('#phone').val()
    var phoneT = document.getElementById('phone').value
    // if (nameT != '' && phoneT != '') { this.form.submit() }
    // else { $('.formDiv').fadeIn(400)}
    // else { this.formDiv.classList.add('active') }
    this.formDiv.classList.add('active')

    document.querySelector('.message').textContent = 'You win!'
  } else {
    document.querySelector('.message').textContent = ''
  }
  State.handleMove()
}

var Main = function () {
  this.tbody = document.querySelector('#highScoresBody')
  this.form = document.querySelector('#game-over')
  this.formDiv = document.querySelector('.formDiv')

  this.firebaseConfig = {
    apiKey: "AIzaSyAA8dQEt-yZnDyY3Lra8lndRJ3LWNYVW0o",
    authDomain: "jumia-c15a3.firebaseapp.com",
    databaseURL: "https://jumia-c15a3.firebaseio.com",
    projectId: "jumia-c15a3",
    storageBucket: "jumia-c15a3.appspot.com",
    messagingSenderId: "295115190934",
    appId: "1:295115190934:web:de0b33b53a514c3c"
  }
  this.db = null
  this.interval = null
  this.GAME = Game.ready()
}

Main.prototype.init = function () {
  firebase.initializeApp(this.firebaseConfig)
  this.db = firebase.firestore()
  this.listeners()
}

Main.prototype.listeners = function () {
  this.moveListener()
  this.keyListeners()
  this.dbListener()
}

Main.prototype.moveListener = function () {
  var self = this
  // this.interval = setInterval(function () { State.handleMove(self.interval) }, 100)
}

Main.prototype.keyListeners = function () {
  var self = this
  $('.keyboard-button').not('.special').click(function (e) {
    e.preventDefault()
    var textK = $(this).text()
    if ($('.formDiv').find('.focused').length > 0) {
      var initialVal = $('.formDiv').find('.focused').val()
      $('.formDiv').find('.focused').val(initialVal + textK)
    } else {
      $('.formDiv').find('input:first').focus()
      var initialVal = $('.formDiv').find('.focused').val()
      $('.formDiv').find('.focused').val(initialVal + textK)
    }
  })
  $('input[type="text"]').focus(function () {
    $('input[type="text"]').each(function () {
      $(this).removeClass('focused')
    })
    $(this).addClass('focused')
  })
  $('.uppercase').click(function (e) {
    e.preventDefault()
    $('.keyboard-button').not('.special').each(function () {
      var buttonText = $(this).text()
      if (buttonText == buttonText.toLowerCase()) {
        buttonText = buttonText.toUpperCase()
      } else {
        buttonText = buttonText.toLowerCase()
      }
      $(this).text(buttonText)
    })
  })
  $('.backspace').click(function (e) {
    e.preventDefault()
    if ($('.formDiv').find('.focused').length > 0) {
      var initialVal = $('.formDiv').find('.focused').val()
      initialVal = initialVal.substring(0, initialVal.length - 1)
      $('.formDiv').find('.focused').val(initialVal)
    } else {
      return
    }
  })
  $('.space-bar').click(function (e) {
    e.preventDefault()
    var textK = ' '
    if ($('.formDiv').find('.focused').length > 0) {
      var initialVal = $('.formDiv').find('.focused').val()
      $('.formDiv').find('.focused').val(initialVal + textK)
    } else {
      $('.formDiv').find('input:first').focus()
      var initialVal = $('.formDiv').find('.focused').val()
      $('.formDiv').find('.focused').val(initialVal + textK)
    }
  })
  $('#submit').click(function (e) {
    e.preventDefault()
    var initBtnTxt = $(this).val()
    var name = $.trim($('#name').val())
    var phone = $.trim($('#phone').val())
    var time = $('#timerTicker').val()
    var moves = $('#movesB').val()
  
    if (phone.length != 10 || name == '') {
      $('.error').fadeIn(300)
    } else {
      self.sendData()
  
      // $('.formDiv').fadeOut(300)
      self.formDiv.classList.remove('active')
      $('.howToPlay').html('<div class="success"><i class="fa fa-check></i> Your record has been submittetd!</div>').fadeIn(500).fadeIn(500).delay(6000).fadeOut(1200)
    }
  })
}

Main.prototype.dbListener = function () {
  var self = this
  this.db.collection('gamers').orderBy('time', 'asc').limit(30)
    .onSnapshot(snapshot => {
      let changes = snapshot.docChanges()
      changes.forEach(change => {
        if (change.type == 'added') {
          self.buildDataVisual(change.doc)
        } else if (change.type == 'removed') {
          let tr = self.tbody.querySelector('[data-id="' + change.doc.id + '"]')
          self.tbody.removeChild(tr)
        }
      })
    })
}

Main.prototype.appendMany2One = function (many, one) { many.forEach(item => one.appendChild(item)) }

Main.prototype.buildDataVisual = function (doc) {
  var self = this
  let tr = document.createElement('tr')
  let name = document.createElement('td')
  let moves = document.createElement('td')
  let time = document.createElement('td')
  tr.setAttribute('data-id', doc.id)
  name.textContent = doc.data().name
  time.textContent = doc.data().time
  moves.textContent = doc.data().moves
  self.appendMany2One([name, time, moves], tr)
  this.tbody.appendChild(tr)
  this.db.collection('gamers').doc(doc.id).onSnapshot({}, function (doc) {
    let tr = self.tbody.querySelector('[data-id="' + doc.id + '"]')
    let name = document.createElement('td')
    let moves = document.createElement('td')
    let time = document.createElement('td')
    name.textContent = doc.data().name
    time.textContent = doc.data().time
    moves.textContent = doc.data().moves
    tr.innerHTML = ''
    self.appendMany2One([name, time, moves], tr)
  })
}

Main.prototype.sendData = function () {
  var self = this
  this.db.collection('gamers').where('phone', '==', self.form.phone.value).get().then((snapshot) => {
    if (snapshot.docs.length > 0) {
      snapshot.docs.forEach(doc => {
        if (doc.data().time > form.time.value) {
          db.collection('gamers').doc(doc.id).set({
            name: self.form.name.value,
            phone: self.form.phone.value,
            moves: +self.form.moves.value,
            time: +self.form.time.value,
            date: firebase.firestore.FieldValue.serverTimestamp()
          })
        }
      })
    } else {
      this.db.collection('gamers').add({
        name: self.form.name.value,
        phone: self.form.phone.value,
        moves: +self.form.moves.value,
        time: +self.form.time.value,
        date: firebase.firestore.FieldValue.serverTimestamp()
      })
    }
  })
}

var main = new Main()
main.init()