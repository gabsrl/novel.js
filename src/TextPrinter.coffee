
### TEXT PRINTING (letter by letter etc.) ###

class TextPrinter
  fullText: ""
  currentOffset: 0
  defaultInterval: 0
  soundBuffer: []
  musicBuffer: []
  stopMusicBuffer: []
  executeBuffer: []
  buffersExecuted: false
  scrollSound: null
  tickSoundFrequency: 1
  tickCounter: 0
  tickSpeedMultiplier: 1
  speedMod: false
  pause: 0
  interval: 0
  printCompleted: false

  # Print a scene's text - noBuffers prevents buffers from replaying when scene is not changed
  printText: (text, noBuffers) ->
    @printCompleted = false
    novelData.printedText = ""
    # Disable the skip button
    if document.querySelector("#skip-button") != null
      document.querySelector("#skip-button").disabled = false;
    @fullText = text
    #console.log fullText
    @currentOffset = -1
    @soundBuffer = []
    @musicBuffer = []
    @stopMusicBuffer = []
    @executeBuffer = []
    @buffersExecuted = false
    if noBuffers
      @buffersExecuted = true
    @defaultInterval = novelData.novel.currentScene.scrollSpeed
    @setTickSoundFrequency(@defaultInterval)
    setTimeout(@onTick(),@defaultInterval)

  # Try to skip text, if allowed
  trySkip: ->
    if novelData.novel.currentScene.skipEnabled
      @complete()

  # Instantly show all text
  complete: ->
    @printCompleted = true
    @currentOffset = 0
    # Re-enable skip button
    if document.querySelector("#skip-button") != null
      document.querySelector("#skip-button").disabled = true;
    # Play missed sounds and start missed music
    if !@buffersExecuted
      ss = []
      first = true
      if @fullText.indexOf("play-sound") > -1
        s = @fullText.split("play-sound ")
        for i in s
          if !first
            ss.push(i.split(/\s|\"/)[0])
          first = false
      if ss.length > 0
        for i in [0 .. ss.length]
          if !(ss[i] in @soundBuffer)
            soundManager.playSound(parser.parseStatement(ss[i]))
      ss = []
      first = true
      if @fullText.indexOf("play-music") > -1
        s = @fullText.split("play-music ")
        for i in s
          if !first
            ss.push(i.split(/\s|\"/)[0])
          first = false
      if ss.length > 0
        for i in [0 .. ss.length]
          if !(ss[i] in @musicBuffer)
            soundManager.startMusic(parser.parseStatement(ss[i]))
      ss = []
      first = true
      if @fullText.indexOf("stop-music") > -1
        s = @fullText.split("stop-music ")
        for i in s
          if !first
            ss.push(i.split(/\s|\"/)[0])
          first = false
      if ss.length > 0
        for i in [0 .. ss.length]
          if !(ss[i] in @stopMusicBuffer)
            soundManager.stopMusic(parser.parseStatement(ss[i]))
      ss = []
      first = true
      if @fullText.indexOf("execute-command") > -1
        s = @fullText.split("execute-command ")
        for i in s
          if !first
            ss.push(i.split(/\s|\"/)[0])
          first = false
      if ss.length > 0
        for i in [0 .. ss.length]
          if !(ss[i] in @executeBuffer) && ss[i] != undefined
            eval(novelData.parsedJavascriptCommands[parseInt(s.substring(4,s.length))])
      @buffersExecuted = true
    # Set printed text and update choices
    novelData.printedText = @fullText
    sceneManager.updateChoices()

  # Stop pause
  unpause: () ->
    if document.querySelector("#continue-button") != null
      document.querySelector("#continue-button").style.display = 'none'
    if @pause == "input"
      @pause = 0

  # Fast text scrolling
  fastScroll: () ->
    if novelData.novel.currentScene.skipEnabled
      @tickSpeedMultiplier = novelData.novel.settings.scrollSettings.fastScrollSpeedMultiplier

  # Stop fast text scrolling
  stopFastScroll: () ->
    @tickSpeedMultiplier = 1

  # Set how frequently the scrolling sound is played
  setTickSoundFrequency: (freq) ->
    threshold = novelData.novel.settings.scrollSettings.tickFreqThreshold
    @tickSoundFrequency = 1
    if freq <= (threshold * 2)
      @tickSoundFrequency = 2
    if freq <= (threshold)
      @tickSoundFrequency = 3

  # Show a new letter
  onTick: ->
    if @pause != "input" && @pause > 0
      @pause--
    if @pause == 0
      if !@speedMod
        @interval = @defaultInterval
      if @defaultInterval == 0
        @complete()
        return
      if novelData.printedText == @fullText
        return
      #console.log currentOffset + ": " + fullText[currentOffset]
      #console.log fullText[currentOffset]
      offsetChanged = false
      while (@fullText[@currentOffset] == ' ' || @fullText[@currentOffset] == '<' || @fullText[@currentOffset] == '>')
        @readTags()
      #console.log fullText[currentOffset-3] + fullText[currentOffset-2] + fullText[currentOffset-1] + " - " + fullText[currentOffset] + " - " + fullText[currentOffset+1]+fullText[currentOffset+2]+fullText[currentOffset+3]
      novelData.printedText = @fullText.substring(0, @currentOffset)
      if !offsetChanged
        @currentOffset++
      if @currentOffset >= @fullText.length
        @complete()
        return
      @tickCounter++
      #console.log tickSpeedMultiplier + " / " + tickSoundFrequency + " / " + tickCounter
      if @tickCounter >= @tickSoundFrequency
        #console.log "RESET"
        if @scrollSound != "none" && @interval != 0
          if @scrollSound != null
            soundManager.playSound(@scrollSound)
          else if (novelData.novel.currentScene.scrollSound != undefined)
            soundManager.playSound(novelData.novel.currentScene.scrollSound)
          @tickCounter = 0
    @setTickSoundFrequency(@interval / @tickSpeedMultiplier)
    setTimeout (->
      textPrinter.onTick()
      return
    ), @interval / @tickSpeedMultiplier

  # Skip chars that are not printed, and parse tags
  readTags: ->
    if @fullText[@currentOffset] == ' '
      @currentOffset++
    if @fullText[@currentOffset] == '>'
      @currentOffset++
    if @fullText[@currentOffset] == '<'
      #console.log "Found <"
      i = @currentOffset
      str = ""
      i++
      while (@fullText[i-1] != '>' && @fullText[i] != '<')
        str = str + @fullText[i]
        i++
      #console.log "Skipped to >"
      str = str.substring(1,str.length)
      #console.log "Haa! " + str
      if str.indexOf("display:none;") > -1
        #console.log "DISPLAY NONE FOUND"
        disp = ""
        spans = 1
        while true
          i++
          disp = disp + @fullText[i]
          if disp.indexOf("/span") != -1
            spans--
            disp = ""
          else if disp.indexOf("span") != -1
            spans++
            disp = ""
          if spans == 0
            break
        i++
      # Buffering
      if str.indexOf("play-sound") > -1 && str.indexOf("display:none;") > -1
        s = str.split("play-sound ")
        s = s[1].split(/\s|\"/)[0]
        @soundBuffer.push(parser.parseStatement(s))
      if str.indexOf("play-music") > -1 && str.indexOf("display:none;") > -1
        s = str.split("play-music ")
        s = s[1].split(/\s|\"/)[0]
        @musicBuffer.push(parser.parseStatement(s))
      if str.indexOf("stop-music") > -1 && str.indexOf("display:none;") > -1
        s = str.split("stop-music ")
        s = s[1].split(/\s|\"/)[0]
        @stopMusicBuffer.push(parser.parseStatement(s))
      if str.indexOf("execute-command") > -1 && str.indexOf("display:none;") > -1
        s = str.split("execute-command ")
        s = s[1].split(/\s|\"/)[0]
        @executeBuffer.push(parser.parseStatement(s))
      if str.indexOf("display:none;") == -1
        if str.indexOf("play-sound") > -1
          s = str.split("play-sound ")
          s = s[1].split(/\s|\"/)[0]
          @soundBuffer.push(parser.parseStatement(s))
          soundManager.playSound(parser.parseStatement(s))
        if str.indexOf("play-music") > -1
          s = str.split("play-music ")
          s = s[1].split(/\s|\"/)[0]
          @musicBuffer.push(parser.parseStatement(s))
          soundManager.startMusic(parser.parseStatement(s))
        if str.indexOf("stop-music") > -1
          s = str.split("stop-music ")
          s = s[1].split(/\s|\"/)[0]
          @stopMusicBuffer.push(parser.parseStatement(s))
          soundManager.stopMusic(parser.parseStatement(s))
        if str.indexOf("pause") > -1
          s = str.split("pause ")
          s = s[1].split(/\s|\"/)[0]
          @pause = s
          if @pause == "input"
            if document.querySelector("#continue-button") != null
              document.querySelector("#continue-button").style.display = 'inline';
        if str.indexOf("execute-command") > -1
          s = str.split("execute-command ")
          s = s[1].split(/\s|\"/)[0]
          @executeBuffer.push(s)
          if s != undefined
            eval(novelData.parsedJavascriptCommands[parseInt(s.substring(4,s.length))])
        if str.indexOf("set-speed") > -1
          s = str.split("set-speed ")
          s = s[1].split(/\s|\"/)[0]
          @interval = parser.parseStatement(s)
          @speedMod = true
        if str.indexOf("default-speed") > -1
          @interval = @defaultInterval
          @speedMod = false
        if str.indexOf("set-scroll-sound") > -1
          s = str.split("set-scroll-sound ")
          s = s[1].split(/\s|\"/)[0]
          @scrollSound = parser.parseStatement(s)
        if str.indexOf("default-scroll-sound") > -1
          @scrollSound = null
      @currentOffset = i
      @offsetChanged = true
