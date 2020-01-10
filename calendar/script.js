// TODO: Factor a scenario when other skus are oos and 1 is still live on a row

var FlipClock = function (options) {
  this.tickInterval = false;
  this.digitSelectors = [];
  this.options = options

  this.init();
};

FlipClock.prototype.init = function () {
  if (this.tickInterval !== false) {
    clearInterval(this.tickInterval);
    this.tickInterval = false;
  }

  this.appendMarkupToContainer();
  this.setDimensions();
  this.start();
};

FlipClock.prototype.setDimensions = function () {
  var flipHeight = parseInt(this.options.containerElement.style.height)
  var flipWidth = flipHeight / 1.55;

  var uls = document.querySelectorAll('ul.flip')
  uls.forEach(ul => {
    ul.style.width = flipWidth + 'px'
    ul.style.fontSize = (flipHeight - 10) + 'px'
    var lis = ul.querySelectorAll('li')
    lis.forEach(li => li.style.lineHeight = (flipHeight) + 'px')
  })
};

FlipClock.prototype.createSegment = function (faceSegmentGroupName) {
  var faceSegmentGroup = this.options.face[faceSegmentGroupName],
    segmentSelectorAddons = ['-ten', '-one'],
    rounded = Math.ceil(faceSegmentGroup.maxValue / 10),
    segment = [];

  if (faceSegmentGroup.maxValue / 10 > 1) {
    segment = [
      {
        selector: this.options.segmentSelectorPrefix + faceSegmentGroupName + segmentSelectorAddons[0],
        ticks: rounded
      }, {
        selector: this.options.segmentSelectorPrefix + faceSegmentGroupName + segmentSelectorAddons[1],
        ticks: 10
      }
    ];
  } else {
    segment = [
      {
        selector: this.options.segmentSelectorPrefix + faceSegmentGroupName + segmentSelectorAddons[1],
        ticks: 10
      }
    ]
  }

  return segment;
};

FlipClock.prototype.appendMarkupToContainer = function () {
  var baseZIndex = 0;

  for (var faceSegmentGroup in this.options.face) {
    this.options.face[faceSegmentGroup].segments = this.createSegment(faceSegmentGroup);

    for (var i = 0; i < this.options.face[faceSegmentGroup].segments.length; i++) {
      var faceSegmentElement = this.createFaceSegment(this.options.face[faceSegmentGroup].segments[i]);

      this.digitSelectors.push(this.options.face[faceSegmentGroup].segments[i].selector);

      this.options.containerElement.appendChild(faceSegmentElement)

      faceSegmentElement.setAttribute('data-face-segment-group', faceSegmentGroup)
      faceSegmentElement.classList.add(faceSegmentGroup)
      faceSegmentElement.style.zIndex = baseZIndex++
    }
  }

  this.digitSelectors.reverse();
};

FlipClock.prototype.createFaceSegment = function (faceSegment) {

  var faceElement = document.createElement('ul')
  faceElement.className = 'flip ' + faceSegment.selector

  for (var i = 0; i < faceSegment.ticks; i++) {
    var digit = i;

    faceElement.appendChild(this.createFaceDigit(digit))
  }

  return faceElement;
};

FlipClock.prototype.createFaceDigit = function (digit) {
  var digitInnerFragment = '<div class="shadow"></div><div class="inn">' + digit + '</div>';
  var up = this.createDirection('up', digitInnerFragment)
  var down = this.createDirection('down', digitInnerFragment)
  var spanWrap = document.createElement('span')
  spanWrap.appendChild(up)
  spanWrap.appendChild(down)
  var li = document.createElement('li')
  li.setAttribute('data-digit', digit)
  li.appendChild(spanWrap)

  return li
};

FlipClock.prototype.createDirection = function (direction, digitInnerFragment) {
  var el = document.createElement('div')
  el.className = direction
  el.innerHTML = digitInnerFragment
  return el
}

FlipClock.prototype.start = function () {
  this.setToTime(this.options.startTime);

  var self = this;

  this.tickInterval = setInterval(function () {
    self.tick();
  }, this.options.tickDuration);
};

FlipClock.prototype.stop = function () {
  window.location.reload(true)
  clearInterval(this.tickInterval);
};

FlipClock.prototype.resetDigits = function () {
  this.options.containerElement.classList.remove('play')

  for (var i = 0; i < this.digitSelectors.length; i++) {

    var all = document.querySelectorAll(this.getDigitSelectorByIndex(i))
    var firstSelector = this.getDigitSelectorByIndex(i) + ":first-child"
    var activeSelector = this.getDigitSelectorByIndex(i) + ".current"

    var first = document.querySelector(firstSelector)
    var active = document.querySelector(activeSelector)

    all[0].classList.add('clockFix')
    all.forEach(each => each.classList.remove('current'))

    first.classList.add('current')

    all.forEach(each => each.classList.remove('previous'))
    active.classList.add('previous')
  }
  this.options.containerElement.classList.add('play')
};

FlipClock.prototype.setToTime = function (time) {
  var timeArray = time.replace(/:/g, '').split('').reverse();

  for (var i = 0; i < this.digitSelectors.length; i++) {

    var dgs = document.querySelectorAll(this.getDigitSelectorByIndex(i))
    var dg = Array.from(dgs).find(dg => parseInt(dg.dataset['digit']) == parseInt(timeArray[i]))

    this.options.containerElement.classList.remove('play')

    dg.classList.add('current')
    this.options.containerElement.classList.add('play')
  }
};

FlipClock.prototype.setFaceSegmentGroupMaxValue = function (segmentGroupName) {
  var self = this;
  var group = this.getFaceSegmentGroupDom(segmentGroupName);

  group.forEach(function (_, idx) {
    self.options.containerElement.classList.remove('play')

    var maxValue = self.options.face[segmentGroupName].maxValue.toString().split('');

    var current = _.querySelector('li.current')
    var maxValue = _.querySelector('li[data-digit="' + maxValue[idx] + '"]')
    current.classList.remove('current')
    maxValue.classList.add('current')

    self.options.containerElement.classList.add('play')
  });
};

FlipClock.prototype.tick = function () {
  this.doTick(0);
};

FlipClock.prototype.getCurrentTime = function () {
  var currentTime = [];

  var currents = document.querySelectorAll('li.current')
  currents.forEach(current => {
    var digit = current.getAttribute('data-digit')
    currentTime.push(digit)
  })

  return parseInt(currentTime.join(''), 10);
};

FlipClock.prototype.getDigitSelectorByIndex = function (digitIndex) {
  return 'ul.' + this.digitSelectors[digitIndex] + ' li';
};

FlipClock.prototype.getFaceSegmentGroupNameByDigitElement = function (digitElement) {
  if (digitElement) { return digitElement.parentElement.getAttribute('data-face-segment-group') }
  return 'seconds'
};

FlipClock.prototype.getFaceSegmentByDigitElement = function (digitElement) {
  return this.options.face[this.getFaceSegmentGroupNameByDigitElement(digitElement)];
};

FlipClock.prototype.getFaceSegmentGroupDom = function (segmentGroupName) {
  return document.querySelectorAll('.' + segmentGroupName)
};

FlipClock.prototype.getCurrentDigitDom = function (segmentGroupName) {
  return document.querySelectorAll('.' + segmentGroupName + ' li.current')
};

FlipClock.prototype.getCurrentFaceSegmentGroupValue = function (digitElement) {
  var segmentGroupName = this.getFaceSegmentGroupNameByDigitElement(digitElement),
    values = [];

  this.getCurrentDigitDom(segmentGroupName).forEach(function (_, idx) {
    values[idx] = _.getAttribute('data-digit')
  });

  return values.join('');
};

FlipClock.prototype.doTick = function (digitIndex) {
  var pseudoSelector;

  // check if we reached maxTime and start over at 00:00:00
  if (this.options.isCountdown === false && this.isMaxTimeReached()) {
    this.resetDigits();
    return;
  }

  this.options.containerElement.classList.remove('play')

  if (this.options.isCountdown === true) {
    pseudoSelector = ":first-child";
  } else {
    pseudoSelector = ":last-child";
  }

  var activeDigit = this.activeDigit(digitIndex, pseudoSelector)
  // set segment to maxValue if it would move past it
  var group = this.getFaceSegmentByDigitElement(activeDigit);
  if (this.getCurrentFaceSegmentGroupValue(activeDigit) > group.maxValue) {
    this.setFaceSegmentGroupMaxValue(this.getFaceSegmentGroupNameByDigitElement(activeDigit));
  }

  this.options.containerElement.classList.add('play')
  this.cleanZIndexFix(activeDigit, this.digitSelectors[digitIndex]);
};

FlipClock.prototype.activeDigit = function (digitIndex, pseudoSelector) {
  var selector = this.getDigitSelectorByIndex(digitIndex) + '.current'
  var plusPseudoSelector = this.getDigitSelectorByIndex(digitIndex) + pseudoSelector

  var activeDigit = document.querySelector(selector)
  var aDPseudoSelector = document.querySelector(plusPseudoSelector)

  var nextDigit = document.createElement('div')

  if (activeDigit.innerHTML == '') {
    if (this.options.isCountdown) {
      var lastSelector = this.getDigitSelectorByIndex(digitIndex) + ":last-child"
      activeDigit = document.querySelector(lastSelector)
      nextDigit = activeDigit.previousSibling
    } else {
      var LIs = this.getDigitSelectorByIndex(digitIndex)
      var digits = document.querySelectorAll(LIs)
      activeDigit = digits[0]
      nextDigit = activeDigit.nextSibling()
    }

    activeDigit.classList.add('previous')
    activeDigit.classList.remove('current')
    nextDigit.classList.add('current')

  } else if (activeDigit.innerHTML === aDPseudoSelector.innerHTML) {
    var allSelector = this.getDigitSelectorByIndex(digitIndex)
    var queries = document.querySelectorAll(allSelector)
    queries.forEach(query => query.classList.remove('previous'))

    // countdown target reached, halt
    if (this.options.isCountdown === true && this.isMinTimeReached()) {
      this.stop();
      return;
    }

    activeDigit.classList.add('previous')
    activeDigit.classList.remove('current')

    if (this.options.isCountdown === true) {
      var lastSelector = this.getDigitSelectorByIndex(digitIndex) + ":last-child"
      activeDigit.classList.add('countdownFix')
      activeDigit = document.querySelector(lastSelector)
    } else {
      activeDigit = queries[0]
      activeDigit.classList.add('clockFix')
    }

    activeDigit.classList.add('current')

    if (typeof this.digitSelectors[digitIndex + 1] !== "undefined") {
      this.doTick(digitIndex + 1);
    }
  } else {
    var selector = this.getDigitSelectorByIndex(digitIndex)
    var queries = document.querySelectorAll(selector)
    queries.forEach(query => query.classList.remove('previous'))

    activeDigit.classList.add('previous')
    activeDigit.classList.remove('current')

    if (this.options.isCountdown === true) {
      nextDigit = activeDigit.previousSibling
    } else {
      nextDigit = activeDigit.nextSibling
    }

    nextDigit.classList.add('current')
  }
  return activeDigit
}

FlipClock.prototype.isMaxTimeReached = function () {
  return this.getCurrentTime() >= parseInt(this.options.maxTime.replace(/:/g, ''), 10);
};

FlipClock.prototype.isMinTimeReached = function () {
  return this.getCurrentTime() <= parseInt(this.options.minTime.replace(/:/g, ''), 10);
};

FlipClock.prototype.cleanZIndexFix = function (activeDigit, selector) {
  if (this.options.isCountdown === true) {
    var allSelector = '.' + selector + ' .countdownFix'
    var fix = document.querySelectorAll(allSelector)
    if (fix.length > 0 && !fix[0].classList.contains('previous') && !fix[0].classList.contains('current')) {
      fix[0].classList.remove('countdownFix')
    }
  } else {
    var index = Array.prototype.slice.call(activeDigit.parentElement.children).indexOf(activeDigit)
    var children = activeDigit.parentElement.children
    var siblings = Array.from(children).filter((_, idx) => idx != index)
    siblings.map(sibling => sibling.classList.remove('clockFix'))
  }
};

var Variables = function () {
  this.now = new Date()
  this.GMT = 'GMT+0100'
  this.LIVE_LINK = '/mobile-apps/'
  this.deepLinks = {
    liveGiveaways: 'https://aal4.adj.st/ng/ss/live-giveaways-app?adjust_t=itk4eyn_9sytz8o&adjust_campaign=NG&adjust_adgroup=CS-20&adjust_creative=GA_PAGE&adjust_deeplink=jumia%3A%2F%2Fng%2Fss%2Flive-giveaways-app&adjust_redirect=https%3A%2F%2Fwww.jumia.com.ng%2Flive-giveaways-app',
    jumiaGames: 'https://aal4.adj.st/ng/ss/jumia-games?adjust_t=itk4eyn_9sytz8o&adjust_campaign=NG&adjust_adgroup=CS-20&adjust_creative=GA_PAGE&adjust_deeplink=jumia%3A%2F%2Fng%2Fss%2Fjumia-games&adjust_redirect=https%3A%2F%2Fwww.jumia.com.ng%2Fjumia-games'
  }
  this.BOB_IMG_LINK = 'https://ng.jumia.is/cms/8-18/clearance-sale/calendar'
  this.extraHours = 0
  this.extraMinutes = 59
  this.rawSKUs = [
    "Live Giveaway Bundle|(2 Indomie pack, 1 Chunky Sneakers, 1 Knee Protector, 1 Eyeshadow box, Black Bell Hand Top - Size 8, Peach Pallazo With Rope - Size 8, 3 Cupboard protector, Automatic Fuel fluid water syphon pump)|January 13 2020 12:00:00 GMT+0100|Win the Bundle|Guess the Price|100|live-giveaway-sku.jpg|liveGiveaways",
    "Puzzle|(Redmi 7-2GB/16GB, Binatone Rechargeagle Juice Blender)|January 14 2020 12:00:00 GMT+0100|₦350,000|Put It Together|100|puzzle-sku.jpg|jumiaGames",
    "Live Giveaway Bundle|(Cubot R15 2GB/16GB, 2 Indomie Cartons, Formal Men Shirt - Pink, 1 Stagenius Eye Shadow, Mobile Phone Telescope Camera magnifier, Pair of Loafers {Men Black Size 43}, Cupboard protector, Zipper Earpiece)|January 15 2020 12:00:00 GMT+0100|Win the Bundle|Guess the Price|100|live-giveaway-sku-wed.jpg|liveGiveaways",
    "Puzzle|(Crown Star Electric Cooker - Dual Burner)|January 16 2020 12:00:00 GMT+0100|₦350,000|Put It Together|100|puzzle-sku-thu.jpg|jumiaGames",
    "Live Giveaway Bundle|(2 Indomie Cartons, Spy Pen, Black Jeans with Zipper, 1 Stagenius Eyeshadow, Formal Men Shirt - Black, Oxford Brogues - Brown, Cupboard Protector, Electronic Mosquito Killer)|January 17 2020 12:00:00 GMT+0100|Win the Bundle|Guess the Price|100|live-giveaway-sku-fri.jpg|liveGiveaways",
  ]
  this.skus = []
  this.skusEl = document.querySelector('.-skus.-fs')
  this.months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ]
  this.daysOfWeek = [
    'sunday', 'monday', 'tuesday',
    'wednesday', 'thursday', 'friday',
    'saturday'
  ]
  // adjust campaignWeeks = ensure dates in rawSKUs are within the range below
  this.campaignWeeks = ['january-13-19']
}

var Sales = function (variables) {
  this.now = variables.now
  this.GMT = variables.GMT
  this.deepLinks = variables.deepLinks
  this.LIVE_LINK = variables.LIVE_LINK
  this.BOB_IMG_LINK = variables.BOB_IMG_LINK
  this.extraHours = variables.extraHours
  this.extraMinutes = variables.extraMinutes
  this.rawSKUs = variables.rawSKUs
  this.skus = []
  this.skusEl = variables.skusEl
  this.months = variables.months
  this.daysOfWeek = variables.daysOfWeek
  this.campaignWeeks = variables.campaignWeeks
  this.interval = null
  this.masksFS = document.querySelector('.md-mask.-fs')
}

Sales.prototype.qSort = function (skus) {
  if (skus.length == 0) { return [] }
  var lesser = [], greater = [], pivot = +new Date(skus[0].split('|')[2])

  for (var i = 1; i < skus.length; i++) {
    var time = +new Date(skus[i].split('|')[2]);
    (time < pivot) ? lesser.push(skus[i]) : greater.push(skus[i])
  }
  return this.qSort(lesser).concat(skus[0], this.qSort(greater))
}

Sales.prototype.expand = function (skus) {
  return skus.map(sku => {
    var split = sku.split('|')
    return {
      name: split[0], desc: split[1], time: split[2],
      oldPrice: split[3], newPrice: split[4], units: split[5],
      img: split[6], page: split[7]
    }
  })
}

Sales.prototype.skuDays = function (skus) {
  var self = this, days = skus.map(sku => self.day(sku))
  return Array.from(new Set(days))
}

Sales.prototype.day = function (sku) {
  var date = new Date(sku['time']).getDate()
  var month = new Date(sku['time']).getMonth()
  return `day-${this.months[month].toLowerCase()}-${date}`
}

Sales.prototype.position = function (num) {
  var j = num % 10, k = num % 100
  if (j == 1 && k != 11) return num + 'st'
  if (j == 2 && k != 12) return num + 'nd'
  if (j == 3 && k != 13) return num + 'rd'
  return num + 'th'
}

Sales.prototype.skuDay = function (time) {
  var day = new Date(time).getDay()
  var month = new Date(time).getMonth()
  var date = new Date(time).getDate()
  var dateTxt = this.position(date)
  if (window.innerWidth < 481) {
    return `${this.daysOfWeek[day].substr(0, 3)} <br/> ${this.months[month].substr(0, 3)} ${dateTxt}`
  }
  return `${this.daysOfWeek[day]} ${this.months[month]} ${dateTxt}`
}

Sales.prototype.groupedSKUs = function (skus, groupKeys, type) {
  return this.updateGroups(skus, groupKeys, type)
}

Sales.prototype.grpSKUs = function (skus) {
  var group = {}, self = this
  this.campaignWeeks.map(week => {
    group[week] = skus.filter(sku => self.timeInWeek(week, sku['time']))
  })
  return group
}

Sales.prototype.timeInWeek = function (week, time) {
  var refsW = this.refsW(week)
  var md = this.md(time)
  return this.timeInWeekCondition(refsW, md)
}

Sales.prototype.campaignWeek = function (time) {
  var self = this
  return this.campaignWeeks.find(week => self.timeInWeekCondition(self.refsW(week), self.md(time)))
}

Sales.prototype.refsW = function (week) {
  var weekPieces = week.split('-')
  var month = weekPieces[0]
  var min = parseInt(weekPieces[1])
  var max = parseInt(weekPieces[2])
  return { month, min, max }
}

Sales.prototype.md = function (time) {
  var monthIdx = new Date(time).getMonth()
  var month = this.months[monthIdx].toLowerCase()
  var date = parseInt(new Date(time).getDate())
  return { month, date }
}

Sales.prototype.timeInWeekCondition = function (refsW, md) {
  return md['month'] == refsW['month'] && this.btw(md['date'], refsW['min'], refsW['max'])
}

Sales.prototype.btw = function (x, min, max) { return x >= min && x <= max }

Sales.prototype.updateGroups = function (skus, groupKeys, type) {
  var self = this, groups = {}, fn = (type === 'time') ? self.time : self.day

  groupKeys.forEach(groupKey => {
    groups[groupKey] = skus.filter(sku => fn.call(self, sku) === groupKey)
  })

  return groups
}

Sales.prototype.setAttributes = function (el, obj) { Object.keys(obj).forEach(key => el.setAttribute(key, obj[key])) }

Sales.prototype.create = function (props) {
  var tag = props[0], attributes = props[1], styles = props[2], textContent = props[3]
  var el = document.createElement(tag); this.setAttributes(el, attributes);
  this.setAttributes(el, styles); textContent ? el.innerHTML = textContent : ''
  return el
}

Sales.prototype.appendMany2One = function (many, one) { many.forEach(item => one.appendChild(item)) }

Sales.prototype.easeOutQuart = function (x, t, b, c, d) {
  return -c * ((t = t / d - 1) * t * t * t - 1) + b;
}

Sales.prototype.tween = function (start, end, duration, easing, w) {
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
    w.scrollLeft = start + delta * factor;
    if (t < duration && w.scrollLeft != end)
      requestAnimationFrame(tweenLoop);
  }
  tweenLoop();
};

Sales.prototype.skuWeek = function (refsW) {
  return `${refsW['month']} ${this.position(refsW['min'])} - ${this.position(refsW['max'])}`
}

Sales.prototype.timeTxt = function (time) {
  var dt = new Date(time)
  var date = this.position(dt.getDate())
  var week = this.daysOfWeek[dt.getDay()]
  var time = this.twelveHrForm(dt.getHours())
  return `${week.substr(0, 3)} ${date}: ${time}`
}

Sales.prototype.buildSKUs = function (marked) {
  var self = this, unique = +new Date('October 12 2020 12:00:00 GMT+0100')
  Object.keys(marked).forEach(key => {
    var rowTime = marked[key][0]['time']
    var rowMilli = +new Date(rowTime);
    var rowClass = (rowMilli === unique) ? `-sku_row -unique -sku_row-${key} pos-rel` : `-sku_row -sku_row-${key} pos-rel`
    var rowProps = {
      skuRow: ['div', { class: rowClass, id: 'unique' }, '', ''],
      skuDayTitle: ['div', { class: '-skuDay_title pos-rel' }, '', ''],
      // skuDayTitleSpan: ['span', '', '', self.skuDay(rowTime)],
      skuDayTitleSpan: ['span', '', '', self.skuWeek(self.refsW(key))],
      daySKUs: ['div', { class: '-day_skus' }, '', ''],
      prev: ['div', { class: '-prev pos-abs' }, '', ''],
      next: ['div', { class: '-next pos-abs' }, '', ''],
    }
    var skuRow = self.create(rowProps['skuRow'])
    var skuDayTitle = self.create(rowProps['skuDayTitle'])
    var skuDayTitleSpan = self.create(rowProps['skuDayTitleSpan'])
    var daySKUs = self.create(rowProps['daySKUs'])
    var prev = self.create(rowProps['prev'])
    var next = self.create(rowProps['next'])

    next.addEventListener('click', function (e) {
      var start = daySKUs.scrollLeft + 50, end = daySKUs.scrollLeft + 300
      self.tween(start, end, 500, self.easeOutQuart, daySKUs);
    });
    prev.addEventListener('click', function (e) {
      var start = daySKUs.scrollLeft - 50, end = daySKUs.scrollLeft - 300
      self.tween(start, end, 500, self.easeOutQuart, daySKUs);
    });
    marked[key].forEach(sku => {
      var skuClass = `-sku -sku_${+new Date(sku['time'])}`
      var timeTxt = self.timeTxt(sku['time'])
      var liveLink = self.LIVE_LINK
      if (window.innerWidth < 481) {
        liveLink = this.deepLinks[sku['page']]
      }
      var skuProps = {
        skuEl: ['div', { class: skuClass }, '', ''],
        coming: ['span', { class: '-coming pos-abs fs' }, '', ''],
        time: ['div', { class: '-time' }, '', timeTxt],
        appOnly: ['div', { class: '-app_only' }, '', 'APP ONLY'],
        imgWrap: ['a', { class: '-img pos-rel', href: liveLink, target: '_blank' }, '', ''],
        shadow: ['div', { class: 'pos-abs -shadow' }, '', ''],
        shadowSpan: ['span', { class: 'pos-abs' }, '', 'sold'],
        img: ['img', { alt: 'sku_img', src: `${this.BOB_IMG_LINK}/${sku['img']}` }, '', ''],
        details: ['div', { class: '-details' }, '', ''],
        name: ['div', { class: '-name' }, '', sku['name']],
        descUnits: ['div', { class: '-desc_units' }, '', ''],
        desc: ['div', { class: '-du -desc' }, '', sku['desc']],
        units: ['div', { class: '-du -units' }, '', `${sku['units']} units`],
        prices: ['div', { class: '-prices' }, '', ''],
        newPrice: ['div', { class: '-price -new_price' }, '', sku['newPrice']],
        oldPrice: ['div', { class: '-price -old_price' }, '', sku['oldPrice']]
      }

      var skuEl = self.create(skuProps['skuEl'])
      var coming = self.create(skuProps['coming'])
      var nextSKU = document.querySelector('.-next.--sku')
      coming.addEventListener('click', () => {
        self.masksFS.classList.add('md-active')
        text = sku['name'] + ' ' + sku['desc'] + ' will be available on <br/>' + self.skuDay(sku['time']).toUpperCase() + ': ' + self.twelveHrForm(new Date(sku['time']).getHours()).toUpperCase() 
        nextSKU.innerHTML = text
      })
      var time = self.create(skuProps['time'])
      var appOnly = self.create(skuProps['appOnly'])
      var imgWrap = self.create(skuProps['imgWrap'])
      var shadow = self.create(skuProps['shadow'])
      var shadowSpan = self.create(skuProps['shadowSpan'])

      var img = self.create(skuProps['img'])
      var details = self.create(skuProps['details'])
      var name = self.create(skuProps['name'])
      var descUnits = self.create(skuProps['descUnits'])
      var desc = self.create(skuProps['desc'])
      var units = self.create(skuProps['units'])
      var prices = self.create(skuProps['prices'])
      var newPrice = self.create(skuProps['newPrice'])
      var oldPrice = self.create(skuProps['oldPrice'])

      shadow.appendChild(shadowSpan)
      self.appendMany2One([shadow, img], imgWrap)
      self.appendMany2One([desc, units], descUnits)

      self.appendMany2One([newPrice, oldPrice], prices)
      self.appendMany2One([name, descUnits, prices], details)
      self.appendMany2One([time, appOnly, imgWrap, details, coming], skuEl)
      daySKUs.appendChild(skuEl)
    })
    skuDayTitle.appendChild(skuDayTitleSpan)
    self.appendMany2One([skuDayTitle, daySKUs, prev, next], skuRow)
    self.skusEl.appendChild(skuRow)
  })
}

Sales.prototype.twelveHrForm = function (time) {
  if (time === 12) { return time + "pm"; }
  else if (time > 12) { return (time - 12) + "pm"; }
  else if (time === 0) { return 12 + "am" }
  else { return time + "am"; }
}

Sales.prototype.setState = function (skus) {
  var keys = Object.keys(skus)
  var firstTime = skus[keys[0]][0]['time']
  var firstStartTime = new Date(firstTime)
  var lastIdx = keys.length - 1
  var lastSKUS = skus[keys[lastIdx]]
  var lastTime = lastSKUS[lastSKUS.length - 1]['time']
  var lastEndTime = new Date(this.endTime(lastTime))

  if (+this.now < +firstStartTime) { this.b41stSession(skus) }
  else if (+this.now > +lastEndTime) { this.aftrLastSession() }
  else { this.inAndBtwSessions(skus) }

  this.setClock(skus)
}

Sales.prototype.clock = function () {
  var props = {
    clock: ['div', { class: 'clock pos-abs' }, '', ''],
    countdown: ['div', { class: '-countdown' }, { style: 'height: 40px' }, ''],
    timeMeasures: ['div', { class: '-time_measures' }, { style: '' }, ''],
    days: ['div', { class: '-time_measure -days' }, '', 'days'],
    hours: ['div', { class: '-time_measure -hours' }, '', 'hrs'],
    minutes: ['div', { class: '-time_measure -minutes' }, '', 'mins'],
    seconds: ['div', { class: '-time_measure -seconds' }, '', 'secs']
  }
  var clock = this.create(props['clock'])
  var countdown = this.create(props['countdown'])
  var timeMeasures = this.create(props['timeMeasures'])
  var days = this.create(props['days'])
  var hours = this.create(props['hours'])
  var minutes = this.create(props['minutes'])
  var seconds = this.create(props['seconds'])

  this.appendMany2One([days, hours, minutes, seconds], timeMeasures)
  this.appendMany2One([countdown, timeMeasures], clock)
  return clock
}

Sales.prototype.remainingTime = function (endTime) {
  var t = +new Date(endTime) - (+new Date())
  var seconds = Math.floor((t / 1000) % 60)
  var minutes = Math.floor((t / 1000 / 60) % 60)
  var hours = Math.floor((t / (1000 * 60 * 60)) % 24)
  var days = Math.floor(t / (1000 * 60 * 60 * 24))

  return { days, hours, minutes, seconds }
}

Sales.prototype.minifyDate = function (title) {
  var span = title.querySelector('span')
  var datePieces = span.textContent.split(' ')
  var minified = datePieces.map((piece, idx) => {
    if (idx == 0) return piece.substr(0, 3)
    return piece.substr(0, 4)
  })
  var final = minified[0] + '<br/>' + minified[1] + ' ' + minified[2] + ' ' + minified[3]
  span.innerHTML = final
}

Sales.prototype.setClock = function (skus) {
  var nextTime = this.nextTime(skus)

  var milliTime = +new Date(nextTime['time'])
  var campaignWeek = this.campaignWeek(nextTime['ref'])
  var clockRow = document.querySelector('.-sku_row-' + campaignWeek)
  var clockParent = clockRow.querySelector('.-skuDay_title')
  var notificationTxt = (nextTime['type'] == 'end') ? 'sale ends in:' : 'sale starts in:'
  var notification = this.create(['div', { class: 'pos-abs -notification' }, '', notificationTxt])
  this.appendMany2One([notification, this.clock()], clockParent)
  if (window.innerWidth < 481)
    this.minifyDate(clockParent)

  var rt = this.remainingTime(milliTime)
  var startTime = Object.keys(rt)
    .map(key => ('0' + rt[key]).slice(-2))
    .join(':')

  var flip = new FlipClock({
    tickDuration: 1000,
    isCountdown: true,
    startTime,
    maxTime: '30:23:59:59',
    minTime: '00:00:00:00',
    containerElement: document.querySelector('.-countdown'),
    segmentSelectorPrefix: 'flipclock-',
    face: {
      days: { maxValue: 31 },
      hours: { maxValue: 23 },
      minutes: { maxValue: 59 },
      seconds: { maxValue: 59 }
    }
  })
  // this.setCountDownTxt(nextTime)
  // this.initializeClock('clockdiv', nextTime['time'])
}

Sales.prototype.endTime = function (time) {
  var date = new Date(time)
  var mt = this.months[date.getMonth()], dt = date.getDate(), yr = date.getFullYear()
  var ct = this.carryTime(date, this.extraHours, this.extraMinutes)
  return `${mt} ${dt} ${yr} ${ct} ${this.GMT}`
}

Sales.prototype.carryTime = function (date, exHrs, exMns) {
  var hr = date.getHours(), mn = date.getMinutes(), sc = date.getSeconds()
  var totalHours = hr + exHrs, totalMinutes = mn + exMns
  if (totalMinutes > 59) { totalMinutes %= 60; totalHours++ }
  return `${this.pad(totalHours)}:${this.pad(totalMinutes)}:${this.pad(sc)}`
}

Sales.prototype.pad = function (time) { return ('0' + time).slice(-2) }

Sales.prototype.b41stSession = function (skus) {
  console.log('b41stSession session')
  var keys = Object.keys(skus)
  var firstTime = skus[keys[0]][0]['time']
}

Sales.prototype.aftrLastSession = function () {
  console.log('after last session')
}

Sales.prototype.inAndBtwSessions = function (skus) {
  console.log('in and between session')
  var keys = Object.keys(skus), isInSess = false
  keys.forEach(key => {
    var keySKUs = skus[key]
    isInSess = this.isInSession(keySKUs);
    (isInSess['flag']) ? this.inSession(isInSess['time']) : this.btwSession()
  })
}

Sales.prototype.setCountDownTxt = function (nextTime) {
  var countDownTxt = document.querySelector('#clockdiv>h3')
  if (nextTime['type'] === 'start') {
    countDownTxt.textContent = 'next sale starts in'
  } else if (nextTime['type'] === 'end') {
    countDownTxt.textContent = 'current sale ends in'
  } else {
    countDownTxt.textContent = 'flash sales are over'
    var timeCircles = document.querySelectorAll('.frame-wrap>div>div>div:first-of-type')
    timeCircles.forEach(circle => {
      circle.style.display = 'none'
    })
  }
}

Sales.prototype.isInSession = function (keySKUs) {
  var obj = { flag: false, time: keySKUs[0]['time'] };
  for (var i = 0; i < keySKUs.length; i++) {
    if (i == 13) {
      console.log()
    }
    var startTime = new Date(keySKUs[i]['time'])
    var endTime = new Date(this.endTime(keySKUs[i]['time']))
    if (+this.now >= +startTime && +this.now < +endTime) {
      obj = { flag: true, time: keySKUs[i]['time'] }
      break
    }
  }
  return obj
}

Sales.prototype.inSession = function (time) {
  var liveSKUS = document.querySelectorAll(`.-sku_${+new Date(time)}`)
  liveSKUS.forEach(sku => {
    var time = sku.querySelector('.-time')
    time.textContent = 'LIVE NOW'
    sku.classList.add('-live')
  })

  var liveSKURow = liveSKUS[0].parentElement.parentElement
  liveSKURow.classList.add('-live')
}

Sales.prototype.btwSession = function () {

}

Sales.prototype.uniqueTimes = function (skus) {
  var times = [], $skus = [], uniqueTimes = []
  Object.keys(skus).forEach(key => $skus.push(...skus[key]))
  times = $skus.map(sku => sku['time'])
  uniqueTimes = Array.from(new Set(times))
  return uniqueTimes
}

Sales.prototype.nextTime = function (skus) {
  var self = this, startEndTimes = [], nextTime = { type: 'over', time: new Date(), ref: new Date() }
  var uniqueTimes = this.uniqueTimes(skus)
  uniqueTimes.forEach(time => {
    startEndTimes.push({ type: 'start', time, ref: time })
    var endTime = this.endTime(time)
    startEndTimes.push({ type: 'end', time: endTime, ref: time })
  })
  var comingTimes = startEndTimes
    .filter(tme => +self.now < +new Date(tme['time']))
  if (comingTimes.length > 0) { nextTime = comingTimes[0] }
  return nextTime
}

Sales.prototype.markAsSold = function (grouped) {
  var self = this
  var uniqueTimes = this.uniqueTimes(grouped)
  uniqueTimes.forEach(uTime => {
    var endTime = self.endTime(uTime)
    var oosSelector = `.-sku_${+new Date(uTime)}`
    if (+self.now > +new Date(endTime)) { self.mark(oosSelector) }
  })
}

Sales.prototype.mark = function (oosSelector) {
  var oosSKUsEls = document.querySelectorAll(oosSelector)
  var parent = null, oosSKUs = []
  oosSKUsEls.forEach(sku => {
    sku.classList.add('-oos')
    oosSKUs.push(sku)
    parent = sku.parentElement
    parent.appendChild(sku)
  })
  this.oosRow(parent)
}

Sales.prototype.oosRow = function (parent) {
  var gParent = parent.parentElement
  var ggParent = gParent.parentElement
  var skusInRow = gParent.querySelectorAll('.-sku')
  var oosSKUs = Array.from(skusInRow).filter(sku => sku.classList.contains('-oos'))
  if (skusInRow.length === oosSKUs.length) {
    ggParent.appendChild(gParent)
  }
}


var Main = function () { this.sales = null }

Main.prototype.init = function () {
  var variables = new Variables()
  this.sales = new Sales(variables)
  var sortedSKUS = this.sales.qSort(this.sales.rawSKUs)
  var expandedSKUS = this.sales.expand(sortedSKUS)
  console.log('expandedSKUS', expandedSKUS)
  var grpSKUs = this.sales.grpSKUs(expandedSKUS)
  this.sales.buildSKUs(grpSKUs)
  this.sales.markAsSold(grpSKUs)
  this.sales.setState(grpSKUs)
}

// Modal Script
var shows = document.querySelectorAll('.md-show');
var masks = document.querySelectorAll('.md-mask');
var closes = document.querySelectorAll('.md-close');

shows.forEach((show, idx) => {
  show.addEventListener('click', function () {
    masks[idx].classList.add('md-active');
  })
})

function closeModal(mask) {
  mask.classList.remove('md-active')
}

closes.forEach((close, idx) => {
  close.addEventListener('click', () => closeModal(masks[idx]));
})

masks.forEach(mask => {
  mask.addEventListener('click', () => closeModal(mask));
})

// Main Script
var main = new Main()
main.init()


// Category Script
var categories = document.getElementById('categories')
var prev = document.getElementById('left')
var next = document.getElementById('right')

next.addEventListener('click', function (e) {
  var start = categories.scrollLeft + 50, end = categories.scrollLeft + 300
  main.sales.tween(start, end, 500, main.sales.easeOutQuart, categories);
});
prev.addEventListener('click', function (e) {
  var start = categories.scrollLeft - 50, end = categories.scrollLeft - 300
  main.sales.tween(start, end, 500, main.sales.easeOutQuart, categories);
});