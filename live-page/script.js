var Box = function (x, y) { this.x = x; this.y = y }

Box.prototype = {
  getTopBox: function () {
    if (this.y === 0) return null
    return new Box(this.x, this.y - 1)
  },
  getRightBox: function () {
    if (this.x === 3) return null
    return new Box(this.x + 1, this.y)
  },
  getBottomBox: function () {
    if (this.y === 3) return null
    return new Box(this.x, this.y + 1)
  },
  getLeftBox: function () {
    if (this.x === 0) return null
    return new Box(this.x - 1, this.y)
  },
  getNextdoorBoxes: function () {
    return [
      this.getTopBox(), this.getRightBox(),
      this.getBottomBox(), this.getLeftBox()
    ].filter(box => box !== null)
  },
  getRandomNextdoorBox: function () {
    const nextdoorBoxes = this.getNextdoorBoxes()
    return nextdoorBoxes[Math.floor(Math.random() * nextdoorBoxes.length)]
  }
}

var State = function (grid, move, time, status) {
  this.grid = grid
  this.move = move
  this.time = time
  this.status = status
}
// [MEDIA_BASE_URL]/cms/8-18/clearance-sale/puzzle/jan-14/1.jpg
State.handleMove = function () {
  var keys = document.querySelectorAll('.grid button')
  keys.forEach(key => {
    var innerText = key.textContent
    key.setAttribute('draggable', true)
    key.setAttribute('ondragstart', 'this.click()')
    if (innerText) {
      key.setAttribute('style', 'background-image:url(https://ng.jumia.is/cms/8-18/clearance-sale/puzzle/jan-14/' + innerText + '.jpg')
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

Game.prototype = {
  tick: function () {
    var timeS = parseInt(this.timerTicker.value, 0)
    timeS += 1
    this.timerTicker.value = timeS
    document.getElementById('time').textContent = `Time: ${timeS}`
  },
  setState: function (newState) {
    this.state = { ...this.state, ...newState }
    this.render()
  },
  handleClickBox: function (box) {
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
  },
  newButton: function (status) {
    var self = this
    var newButton = document.createElement('button')
    newButton.setAttribute('draggable', true)
    newButton.setAttribute('ondragstart', 'this.click()')
  
    if (status === 'ready' || status === 'won') {
      newButton.textContent = 'Play'
      newButton.setAttribute('id', 'playButton')
      newButton.classList.add('-play')
    } else {
      newButton.textContent = 'Reset'
    }
    // if (status === 'ready') newButton.textContent = 'Play'
    // if (status === 'ready') newButton.setAttribute('id', 'playButton')
    // if (status === 'playing') newButton.textContent = 'Reset'
    // if (status === 'won') newButton.textContent = 'Play'
    // if (status === 'won') newButton.setAttribute('id', 'playButton')
  
    newButton.addEventListener('click', () => {
      clearInterval(this.tickId)
      self.timerTicker.value = 0
      self.formDiv.classList.remove('active')
      this.tickId = setInterval(this.tick, 1000)
      this.setState(State.start())
    })
  
    return newButton
  },
  render: function () {
    const { grid, move, status } = this.state
    const newGrid = document.createElement('div')
    newGrid.className = 'grid'
    for (let i = 0; i < 4; i++) {
      for (let j = 0; j < 4; j++) {
        const button = document.createElement('button')
        const buttonSpan = document.createElement('span')
        if (status === 'playing') {
          button.addEventListener('click', this.handleClickBox(new Box(j, i)))
        }
        buttonSpan.textContent = grid[i][j] === 0 ? '' : grid[i][j].toString()
        button.appendChild(buttonSpan)
        // button.textContent = grid[i][j] === 0 ? '' : grid[i][j].toString()
        newGrid.appendChild(button)
      }
    }
  
    document.querySelector('.grid').replaceWith(newGrid)
    const newButton = this.newButton(status)
  
    document.querySelector('.footer button').replaceWith(newButton)
    document.getElementById('move').textContent = `Moves: ${move}`
    document.getElementById('movesB').value = move
  
    if (status === 'won') {
      document.querySelector('.howToPlay').style.display = 'none'
      this.formDiv.classList.add('active')
      document.querySelector('.message').textContent = 'You win!'
    } else {
      document.querySelector('.howToPlay').style.display = 'block'
      document.querySelector('.message').textContent = ''
    }
    State.handleMove()
  }
}


var Main = function () {
  this.tbody = document.querySelector('#highScoresBody')
  this.arrowUp = document.querySelector('.-arrow_up')
  this.arrowDown = document.querySelector('.-arrow_down')
  this.scrollUp = document.querySelector('.-scroll_up')
  this.scrollDown = document.querySelector('.-scroll_down')
  this.form = document.querySelector('#game-over')
  this.formDiv = document.querySelector('.formDiv')
  this.name = document.getElementById('name')
  this.email = document.getElementById('email')
  this.keyboardBtns = document.querySelectorAll('.keyboard-button:not(.special)')
  this.error = document.querySelector('.error')
  this.currentField = 'name'
  this.howToPlay = document.querySelector('.howToPlay')

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
  this.qualifierEls = []
}

Main.prototype = {
  init: function () {
    firebase.initializeApp(this.firebaseConfig)
    this.db = firebase.firestore()
    this.listeners()
  },
  listeners: function () {
    this.keyListeners()
    this.dbListener()
    this.scrollListener()
  },
  keyListeners: function () {
    var self = this
    this.keyboardBtns.forEach(keyboardBtn => {
      keyboardBtn.addEventListener('click', function (e) {
        e.preventDefault()
        var textK = keyboardBtn.textContent
        var focusedEl = self.formDiv.querySelector('.focused')
        if (!focusedEl) {
          focusedEl = self.formDiv.querySelector('input:first-child')
        }
        var initialVal = focusedEl.value
        focusedEl.value = initialVal + textK
      })
    })
  
    var inputs = document.querySelectorAll('input[type="text"]')
    inputs.forEach(input => {
      input.addEventListener('focus', function () {
        inputs.forEach($input => $input.classList.remove('focused'))
        input.classList.add('focused')
      })
    })
  
    var uppercase = document.querySelector('.uppercase')
    uppercase.addEventListener('click', function (e) {
      e.preventDefault()
      self.keyboardBtns.forEach(keyboardBtn => {
        var buttonText = keyboardBtn.textContent
        if (buttonText === buttonText.toLowerCase()) {
          buttonText = buttonText.toUpperCase()
        } else { buttonText = buttonText.toLowerCase() }
        keyboardBtn.textContent = buttonText
      })
    })
  
    var backspace = document.querySelector('.backspace')
    backspace.addEventListener('click', function (e) {
      e.preventDefault()
      var focusedEl = self.formDiv.querySelector('.focused')
      if (focusedEl) {
        var initialVal = focusedEl.value
        initialVal = initialVal.substring(0, initialVal.length - 1)
        focusedEl.value = initialVal
      }
    })
  
    var spacebar = document.querySelector('.space-bar')
    spacebar.addEventListener('click', function (e) {
      e.preventDefault()
      var textK = ' '
      var focusedEl = self.formDiv.querySelector('.focused')
      if (!focusedEl) {
        focusedEl = self.formDiv.querySelector('input:first-child')
      }
      var initialVal = focusedEl.value + textK
      focusedEl.value = initialVal
    })
  
    var submit = document.getElementById('submit')
    submit.addEventListener('click', function (e) {
      e.preventDefault()
      var name = document.getElementById('name').value
      var email = document.getElementById('email').value
  
      if (!self.validateEmail(email) || name == '') {
        self.error.classList.add('active')
      } else {
        self.error.classList.remove('active')
        self.formDiv.classList.remove('active')
        self.sendData()
        self.howToPlay.style.display = 'block'
        self.howToPlay.innerHTML = '<div class="success">Your record has been submitted!</div>'
      }
    })
  },
  dbListener: function () {
    var self = this
    this.db.collection('puzzle')
      .onSnapshot(snapshot => {
        var list = [], listObj = {}
        snapshot.docChanges().forEach(change => listObj = change.doc.data())
        Object.keys(listObj).forEach(key => list.push(listObj[key]))
        self.buildDataVisual(list)
      }, err => console.error(err.message))
  },
  scrollListener: function () {
    var self = this
    self.arrowUp.classList.add('-off')
    this.tbody.addEventListener('scroll', function () {
      var isEndOfTable = self.tbody.scrollHeight - self.tbody.offsetHeight == self.tbody.scrollTop
      var isTopOfTable = self.tbody.scrollTop == 0
      var aUfn = self.arrowUp.classList
      var aDfn = self.arrowDown.classList

      isTopOfTable ? aUfn.add('-off') : aUfn.remove('-off');
      isEndOfTable ? aDfn.add('-off') : aDfn.remove('-off');
      
      // isTopOfTable ? self.scrollUp.add('-grayout') : self.scrollUp.remove('-grayout');
      // isEndOfTable ? self.scrollDown.add('-grayout') : self.scrollDown.remove('-grayout');
    })
    
    self.scrollUp.addEventListener('click', function (e) {
      var start = self.tbody.scrollTop - 10, end = self.tbody.scrollTop - 80
      self.tween(start, end, 500, self.easeOutQuart, self.tbody);
    });
    self.scrollDown.addEventListener('click', function (e) {
      var start = self.tbody.scrollTop + 10, end = self.tbody.scrollTop + 80
      self.tween(start, end, 500, self.easeOutQuart, self.tbody);
    })
  },
  easeOutQuart: function (x, t, b, c, d) {
    return -c * ((t = t / d - 1) * t * t * t - 1) + b;
  },
  tween: function (start, end, duration, easing, w) {
    var delta = end - start;
    var startTime;
    if (window.performance && window.performance.now) {
      startTime = performance.now();
    } else if (Date.now) {
      startTime = Date.now();
    } else {
      startTime = new Date().getTime();
    }
    var tweenLoop = function (time) {
      var t = (!time ? 0 : time - startTime);
      var factor = easing(null, t, 0, 1, duration);
      w.scrollTop = start + delta * factor;
      if (t < duration && w.scrollTop != end)
        requestAnimationFrame(tweenLoop);
    }
    tweenLoop();
  },
  validateEmail: function (email) {
    var re = /\S+@\S+\.\S+/
    return re.test(email)
  },
  appendMany2One: function (many, one) { many.forEach(item => one.appendChild(item)) },
  setAttributes: function (el, obj) { Object.keys(obj).forEach(key => el.setAttribute(key, obj[key])) },
  create: function (props) {
    var tag = props[0], attributes = props[1], styles = props[2], textContent = props[3]
    var el = document.createElement(tag); this.setAttributes(el, attributes);
    this.setAttributes(el, styles); textContent ? el.innerHTML = textContent : ''
    return el
  },
  isInQualifierEls: function (qualifier) {
    var idx = this.qualifierEls.findIndex(el => el.getAttribute('id') === qualifier.email)
    if (idx !== -1) { return this.qualifierEls[idx] }
    return false
  },
  buildDataVisual: function (list) {
    this.createOrUpdateQualifierEl(list)
    var sorted = this.sortTable(this.qualifierEls)
    this.appendTable(sorted)
  },
  isAEqualB: function (a, b) {
    return a.getAttribute('id') === b.getAttribute('id')
  },
  appendTable: function (list) {
    var self = this;
    this.tbody.innerHTML = ""
    list.forEach(el => self.tbody.appendChild(el));
  },
  value: function (el, param) { return el.querySelector('.-' + param).textContent; },
  sortTable: function (list) {
    var self = this, finalList = []
    var times = list.map(qualifier => parseInt(self.value(qualifier, 'time')))
    var timesSet = new Set(times)
    var sortedTimes = [...timesSet].sort((a, b) => a - b)

    sortedTimes.map(time => {
      var sortedDuplicates = list.filter(item => parseInt(self.value(item, 'time')) == time)
      .sort((a, b) => parseInt(self.value(a, 'moves')) - parseInt(self.value(b, 'moves')))
      sortedDuplicates.forEach(el => finalList.push(el))
    })
    finalList.map((node, idx) => {
      node.querySelector('.-number').textContent = idx + 1
      return node
    })

    return finalList
  },
  createOrUpdateQualifierEl: function (list) {
    var self = this
    list.forEach((qualifier, idx) => {
      qualifier.number = idx + 1
      var inQualifierEls = self.isInQualifierEls(qualifier);
      (inQualifierEls) ? self.updateEl(qualifier, inQualifierEls) : self.createEl(qualifier)
    })
  },
  createEl: function (qualifier) {
    var props = {
      tr: ['div', { 'id': qualifier.email, class: '-tr' }, '', ''],
      number: ['div', { class: '-number -td -inline_block' }, '', qualifier.number],
      name: ['div', { class: '-name -td -inline_block' }, '', qualifier.name],
      time: ['div', { class: '-time -td -inline_block' }, '', qualifier.time],
      moves: ['div', { class: '-moves -td -inline_block' }, '', qualifier.moves]
    }
    var tr = this.create(props['tr'])
    var number = this.create(props['number'])
    var name = this.create(props['name'])
    var time = this.create(props['time'])
    var moves = this.create(props['moves'])
    this.appendMany2One([number, name, time, moves], tr)
    this.qualifierEls.push(tr)
  },
  updateEl: function (qualifier, inQualifierEls) {
    inQualifierEls.querySelector('.-name').textContent = qualifier['name']
    inQualifierEls.querySelector('.-time').textContent = qualifier['time']
    inQualifierEls.querySelector('.-moves').textContent = qualifier['moves']
  },
  sendData: function () {
    var collection = this.db.collection('puzzle')
    var dbData = {}
    var data = {
      name: this.form.name.value, email: this.form.email.value,
      moves: +this.form.moves.value, time: +this.form.time.value,
      date: +new Date()
    }
    dbData[data['email']] = data
  
    collection.doc('data').set(dbData, { merge: true })
      .then(_ => console.log('sent'))
      .catch(err => console.log(err));
  }
}

var main = new Main()
main.init()
