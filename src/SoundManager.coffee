
### SOUNDS ###

# A class for sound functions
class SoundManager

  # Play the default sound for clicking an item
  playDefaultClickSound: (name,clicked) ->
    @playSound(novelData.novel.settings.soundSettings.defaultClickSound,false)

  # Play a sound by name
  playSound: (name, isMusic) ->
    for s in novelData.novel.sounds
      if s.name == name
        sound = new Audio(novelPath+'/sounds/'+s.file)
        if isMusic
          sound.volume = novelData.novel.settings.soundSettings.musicVolume
        else
          sound.volume = novelData.novel.settings.soundSettings.soundVolume
        sound.play()
        return sound

  # Is music playing?
  isPlaying: (name) ->
    for i in novelData.music
      if i.paused
        return false
      else
        return true

  # Start music
  startMusic: (name) ->
    music = @playSound(name,true)
    music.addEventListener 'ended', (->
      @currentTime = 0
      @play()
      return
    ), false
    novelData.music.push {"name":name,"music":music}

  # Stop a music that was started previously
  stopMusic: (name) ->
    for i in novelData.music
      if name == i.name
        i.music.pause()
        index = novelData.music.indexOf(i)
        novelData.music.splice(index,1)
