var GameManager,InputManager,InventoryManager,Parser,SceneManager,SoundManager,TextPrinter,UI,Util,copyButton,data,gameArea,gameManager,gamePath,inputManager,inventoryManager,parser,sceneManager,soundManager,textPrinter,ui,util,indexOf=[].indexOf||function(e){for(var t=0,n=this.length;n>t;t++)if(t in this&&this[t]===e)return t;return-1};GameManager=function(){function e(){}return e.prototype.loadCookie=function(e){var t,n,s,r;for(r=e+"=",n=document.cookie.split(";"),s=0;s<n.length;){for(t=n[s];" "===t.charAt(0);)t=t.substring(1);if(0===t.indexOf(r))return t.substring(r.length,t.length);s++}return""},e.prototype.saveCookie=function(e,t,n){var s,r;return s=new Date,s.setTime(s.getTime()+24*n*60*60*1e3),r="expires="+s.toUTCString(),document.cookie=e+"="+t+"; "+r+"; path=/"},e.prototype.loadGame=function(e){var t,n;if(void 0===e){if(""!==this.loadCookie("gameData"))return console.log("Cookie found!"),t=this.loadCookie("gameData"),console.log("Cookie loaded"),console.log(t),n=JSON.parse(atob(this.loadCookie("gameData"))),this.prepareLoadedGame(n)}else if(void 0!==e)return n=JSON.parse(atob(e)),this.prepareLoadedGame(n)},e.prototype.prepareLoadedGame=function(e){return data.game.gameName!==e.gameName?void console.error("ERROR! Game name mismatch"):(data.game.version!==e.version&&console.warn("WARNING! Game version mismatch"),data.game=e,data.debugMode=data.game.debugMode,sceneManager.updateScene(data.game.currentScene,!0))},e.prototype.startGame=function(){var e;return e=new XMLHttpRequest,e.open("GET",gamePath+"/game.json",!0),e.onload=function(){var t;return e.status>=200&&e.status<400?(t=JSON.parse(e.responseText),t=gameManager.prepareData(t),data.game=t,data.game.currentScene=sceneManager.changeScene(data.game.scenes[0].name),data.debugMode=data.game.debugMode):void 0},e.onerror=function(){},e.send(),null!==document.querySelector("#continue-button")?document.querySelector("#continue-button").style.display="none":void 0},e.prototype.saveGameAsJson=function(){var e;return e=btoa(JSON.stringify(data.game))},e.prototype.saveGame=function(){var e;return e=this.saveGameAsJson(),"cookie"===data.game.settings.saveMode?this.saveCookie("gameData",e,365):"text"===data.game.settings.saveMode?ui.showSaveNotification(e):void 0},e.prototype.prepareData=function(e){var t,n,s,r,a,i,o,u,l,p,d,c;for(e.currentScene="",e.parsedChoices="",void 0===e.inventory&&(e.inventory=[]),void 0===e.scenes&&(e.scenes=[]),l=e.inventory,s=0,a=l.length;a>s;s++)n=l[s],void 0===n.displayName&&(n.displayName=n.name);for(p=e.scenes,r=0,i=p.length;i>r;r++)for(c=p[r],c.combinedText="",c.parsedText="",d=c.choices,u=0,o=d.length;o>u;u++)t=d[u],t.parsedText="",void 0===t.nextScene&&(t.nextScene=""),void 0===t.alwaysShow&&(t.alwaysShow=!1);return e},e}(),InputManager=function(){function e(){}return e.prototype.presses=0,e.prototype.keyDown=function(e){return 13===e||32===e?(data.game.settings.scrollSettings.continueWithKeyboard&&sceneManager.tryContinue(),data.game.settings.scrollSettings.skipWithKeyboard&&textPrinter.trySkip(),textPrinter.unpause()):void 0},e.prototype.keyPressed=function(e){return this.presses++,(13===e||32===e)&&this.presses>2&&data.game.settings.scrollSettings.fastScrollWithKeyboard?textPrinter.fastScroll():void 0},e.prototype.keyUp=function(e){return this.presses=0,13===e||32===e?textPrinter.stopFastScroll():void 0},e}(),document.onkeydown=function(e){var t;return e=e||window.event,t=e.keyCode||e.which,inputManager.keyDown(t)},document.onkeypress=function(e){var t;return e=e||window.event,t=e.keyCode||e.which,inputManager.keyPressed(t)},document.onkeyup=function(e){var t;return e=e||window.event,t=e.keyCode||e.which,inputManager.keyUp(t)},Parser=function(){function Parser(){}return Parser.prototype.parseItems=function(e){var t,n,s,r,a;if(""!==e){for(a=e.split("|"),r=[],n=0,s=a.length;s>n;n++)t=a[n],t=t.split(","),r.push(t);return r}},Parser.prototype.parseText=function(e){var t,n,s,r,a,i,o,u,l,p,d,c,f,g,h,m,v,y,S,x,M,k,T;if(void 0!==e){for(h=data.game.tagPresets,r=0,i=h.length;i>r;r++)n=h[r],k="[p "+n.name+"]",e.indexOf(k)>-1&&(e=e.split(k).join(n.start)),k="[/p "+n.name+"]",e.indexOf(k)>-1&&(e=e.split(k).join(n.end));for(n=a=0;99>=a;n=++a)e=e.split("[s"+n+"]").join('<span class="highlight-'+n+'">');for(e=e.split("[/s]").join("</span>"),M=e.split(/\[|\]/),x=0,t=0,s=l=0,m=M.length-1;m>=0?m>=l:l>=m;s=m>=0?++l:--l){if(S=M[s],"if"===S.substring(0,2))f=S.split("if "),this.parseStatement(f[1])?M[s]="":(M[s]='<span style="display:none;">',x++);else if("/if"===S.substring(0,3))x>0?(M[s]="</span>",x--):M[s]="";else if("inv."===S.substring(0,4))for(T=S.substring(4,S.length),v=data.game.inventory,d=0,o=v.length;o>d;d++)n=v[d],n.name===T&&(M[s]=n.value);else if("print"===S.substring(0,5))f=S.split("print "),f=this.parseStatement(f[1]),isNaN(parseFloat(f))||(f=parseFloat(f.toFixed(data.game.settings.floatPrecision))),M[s]=f;else if("exec"===S.substring(0,4))f=S.substring(5,S.length),c=data.parsedJavascriptCommands.push(f),c--,M[s]='<span class="execute-command com-'+c+'"></span>';else if("pause"===S.substring(0,5))f=S.substring(6,S.length),M[s]='<span class="pause '+f+'"></span>';else if("sound"===S.substring(0,5))f=S.split("sound "),M[s]='<span class="play-sound '+f[1]+'"></span>';else if("stopMusic"===S.substring(0,9))f=S.split("stopMusic "),M[s]='<span class="stop-music '+f[1]+'"></span>';else if("music"===S.substring(0,5))f=S.split("music "),M[s]='<span class="play-music '+f[1]+'"></span>';else if("/speed"===S.substring(0,6))M[s]='<span class="default-speed"></span>';else if("speed"===S.substring(0,5))f=S.split("speed "),M[s]='<span class="set-speed '+f[1]+'"></span>';else if("/scrollSound"===S.substring(0,12))M[s]='<span class="default-scroll-sound"></span>';else if("scrollSound"===S.substring(0,11))f=S.split("scrollSound "),M[s]='<span class="set-scroll-sound '+f[1]+'"></span>';else if("input"===S.substring(0,5)){for(f=S.split("input "),p="",y=data.game.inventory,g=0,u=y.length;u>g;g++)n=y[g],n.name===f[1]&&(p=n.value);M[s]='<input type="text" value="'+p+'" name="input" class="input-'+f[1]+'" onblur="ui.updateInputs(true)">'}else"choice"===S.substring(0,6)?(f=S.split("choice "),M[s]='<a href="#" onclick="sceneManager.selectChoiceByNameByClicking(event,\''+f[1]+"')\">",t++):"/choice"===S.substring(0,7)&&(t>0?(M[s]="</a>",t--):M[s]="");s++}return e=M.join("")}},Parser.prototype.parseStatement=function(s){var found,i,k,l,len,len1,m,parsedString,parsedValues,ref,ref1,type,val;for(s=s.toString(),util.validateParentheses(s)||console.error("ERROR: Invalid parentheses in statement"),s=s.replace(/\s+/g,""),parsedString=s.split(/\(|\)|\+|\*|\-|\/|<=|>=|<|>|==|!=|\|\||&&/),parsedValues=[],k=0,len=parsedString.length;len>k;k++)switch(val=parsedString[k],type=this.getStatementType(val)){case"item":for(found=!1,ref=data.game.inventory,l=0,len1=ref.length;len1>l;l++)i=ref[l],i.name===val.substring(4,val.length)&&(parsedValues.push(i.value),found=!0);found||parsedValues.push(0);break;case"var":val=this.findValue(val.substring(4,val.length),!0),isNaN(parseFloat(val))?parsedValues.push("'"+val+"'"):parsedValues.push(parseFloat(val).toFixed(data.game.settings.floatPrecision));break;case"float":parsedValues.push(parseFloat(val).toFixed(data.game.settings.floatPrecision));break;case"int":parsedValues.push(parseInt(val));break;case"string":""!==val?parsedValues.push("'"+val+"'"):parsedValues.push("")}for(i=m=0,ref1=parsedString.length-1;ref1>=0?ref1>=m:m>=ref1;i=ref1>=0?++m:--m)""!==parsedString[i]&&""!==parsedValues[i]&&(s=s.replace(new RegExp(parsedString[i],"g"),parsedValues[i]));return eval(s)},Parser.prototype.getStatementType=function(e){var t;return t=null,t="inv."===e.substring(0,4)?"item":"var."===e.substring(0,4)?"var":isNaN(parseFloat(e))||-1!==e.toString().indexOf(".")?isNaN(parseFloat(e))||-1===e.toString().indexOf(".")?"string":"float":"int"},Parser.prototype.findValue=function(e,t){var n,s,r,a,i;for(a=e.split(","),i=t?this.findValueByName(data.game,a[0])[0]:a.length>1?this.findValueByName(data.game,a[0])[0]:this.findValueByName(data.game,a[0])[1],n=s=0,r=a.length-1;r>=0?r>=s:s>=r;n=r>=0?++s:--s)util.isOdd(n)?i=i[parseInt(a[n])]:0!==n&&(t?(("parsedText"===a[n]||"text"===a[n])&&(a[n]="parsedText",i.parsedText=this.parseText(i.text)),i=this.findValueByName(i,a[n])[0]):i=this.findValueByName(i,a[n])[1]);return i},Parser.prototype.findValueByName=function(e,t){var n,s,r,a;return r=t.split("."),n=e[r[0]],r[1]?(r.splice(0,1),s=r.join("."),this.findValueByName(n,s)):(a=[],a[0]=n,a[1]=e,a)},Parser}(),InventoryManager=function(){function e(){}return e.prototype.checkRequirements=function(e){var t,n,s,r,a,i,o,u;for(u=0,o=data.game.inventory,s=0,a=o.length;a>s;s++)for(t=o[s],r=0,i=e.length;i>r;r++)n=e[r],n[0]===t.name&&n[1]<=t.value&&(u+=1);return u===e.length?!0:!1},e.prototype.setValue=function(e,t){var n,s;return n=this.getValueArrayLast(e),s=parser.findValue(e,!1),s[n]=t},e.prototype.increaseValue=function(e,t){var n,s;return n=this.getValueArrayLast(e),s=parser.findValue(e,!1),s[n]=s[n]+t,isNaN(parseFloat(s[n]))?void 0:s[n]=parseFloat(s[n].toFixed(data.game.settings.floatPrecision))},e.prototype.decreaseValue=function(e,t){var n,s;return n=this.getValueArrayLast(e),s=parser.findValue(e,!1),s[n]=s[n]-t,isNaN(parseFloat(s[n]))?void 0:s[n]=parseFloat(s[n].toFixed(data.game.settings.floatPrecision))},e.prototype.getValueArrayLast=function(e){var t;return t=e.split(","),t=t[t.length-1].split("."),t=t[t.length-1]},e.prototype.editItems=function(e,t){var n,s,r,a,i,o,u,l,p,d,c,f,g,h;for(g=[],o=0,l=e.length;l>o;o++){for(i=e[o],s=!1,"!"===i[0].substring(0,1)&&(s=!0,i[0]=i[0].substring(1,i[0].length)),a=!1,f=data.game.inventory,u=0,p=f.length;p>u;u++)r=f[u],r.name===i[0]&&(d=1,i.length>2?(n=i[2],h=parseInt(parser.parseStatement(i[1])),isNaN(n)||(d=i[2],n=i.name),i.length>3&&(d=parseFloat(i[2]),n=i[3])):(n=i[0],h=parseInt(parser.parseStatement(i[1]))),c=Math.random(),d>c&&("set"===t?isNaN(parseInt(i[1]))?r.value=i[1]:r.value=parseInt(i[1]):"add"===t?(isNaN(parseInt(r.value))&&(r.value=0),r.value=parseInt(r.value)+h):"remove"===t&&(isNaN(parseInt(r.value))?r.value=0:(r.value=parseInt(r.value)-h,r.value<0&&(r.value=0)))),a=!0);a||"remove"===t?g.push(void 0):(d=1,h=parseInt(parser.parseStatement(i[1])),isNaN(h)&&(h=parser.parseStatement(i[1])),i.length>2?(n=i[2],isNaN(n)||(d=i[2],n=i.name),i.length>3&&(d=parseFloat(i[2]),n=i[3])):n=i[0],c=Math.random(),d>c?g.push(data.game.inventory.push({name:i[0],value:h,displayName:n,hidden:s})):g.push(void 0))}return g},e}(),SceneManager=function(){function SceneManager(){}return SceneManager.prototype.tryContinue=function(){return textPrinter.printCompleted&&1===textPrinter.tickSpeedMultiplier?this.selectChoiceByName("Continue"):void 0},SceneManager.prototype.selectChoice=function(e){return this.exitScene(data.game.currentScene),this.readItemEdits(e),this.readSounds(e,!0),this.readSaving(e),this.readExecutes(e),this.readCheckpoints(e),""!==e.nextScene?this.changeScene(e.nextScene):""===e.nextScene?void 0!==e.nextChoice?this.selectChoiceByName(this.selectRandomOption(e.nextChoice)):this.updateScene(data.game.currentScene,!0):void 0},SceneManager.prototype.selectChoiceByNameByClicking=function(e,t){return e.stopPropagation(),e.preventDefault(),this.selectChoiceByName(t)},SceneManager.prototype.selectChoiceByName=function(e){var t,n,s,r,a;for(r=data.game.currentScene.choices,a=[],n=0,s=r.length;s>n;n++){if(t=r[n],t.name===e){gameArea.selectChoice(t);break}a.push(void 0)}return a},SceneManager.prototype.exitScene=function(e){return ui.updateInputs(!1)},SceneManager.prototype.changeScene=function(e){var t;return t=this.findSceneByName(this.selectRandomOption(e)),this.setupScene(t),t},SceneManager.prototype.setupScene=function(e){return this.updateScene(e,!1),this.readItemEdits(data.game.currentScene),this.readSounds(data.game.currentScene,!1),this.readSaving(data.game.currentScene),this.readExecutes(data.game.currentScene),this.readCheckpoints(data.game.currentScene),this.readMisc(data.game.currentScene),textPrinter.printText(e.parsedText,!1)},SceneManager.prototype.updateScene=function(e,t){return this.combineSceneTexts(e),e.parsedText=parser.parseText(e.combinedText),data.game.currentScene=e,t?(textPrinter.printText(e.parsedText,!0),textPrinter.complete()):data.game.parsedChoices=null},SceneManager.prototype.updateChoices=function(){return gameArea.$set("game.parsedChoices",data.game.currentScene.choices.map(function(e){return e.parsedText=parser.parseText(e.text),gameArea.game.settings.alwaysShowDisabledChoices&&(e.alwaysShow=!0),e}))},SceneManager.prototype.selectRandomOption=function(e){var t,n,s,r,a;if(a=e.split("|"),1===a.length)return a[0];for(r=[],n=0,s=a.length;s>n;n++)t=a[n],t=t.split(","),r.push(t);return r=this.chooseRandomly(r)},SceneManager.prototype.chooseRandomly=function(e){var t,n,s,r,a,i,o,u,l,p,d,c,f,g;for(p=[],t=[],c=[],d=0,s=0,a=e.length;a>s;s++)n=e[s],p.push(n[0]),d=parseFloat(n[1])+d,t.push(d),c.push(parseFloat(n[1]));for(f=0,r=0,i=c.length;i>r;r++)n=c[r],f+=parseFloat(n);for(1!==f&&console.error("ERROR: Invalid scene or choice odds (should add up to exactly 1)!"),g=Math.random(),l=0,u=0,o=t.length;o>u;u++){if(n=t[u],n>g)return p[l];l++}},SceneManager.prototype.findSceneByName=function(e){var t,n,s,r;for(r=data.game.scenes,n=0,s=r.length;s>n;n++)if(t=r[n],t.name===e)return t;return console.error("ERROR: Scene by name '"+e+"' not found!")},SceneManager.prototype.combineSceneTexts=function(e){var t,n,s,r,a;if(e.combinedText="","[object Array]"===Object.prototype.toString.call(e.text)){for(r=e.text,a=[],n=0,s=r.length;s>n;n++)t=r[n],a.push(e.combinedText=e.combinedText+"<p>"+t+"</p>");return a}return e.combinedText=e.text},SceneManager.prototype.readItemEdits=function(e){var t,n,s,r,a,i,o,u,l,p,d;if(void 0!==e.removeItem&&inventoryManager.editItems(parser.parseItems(e.removeItem),"remove"),void 0!==e.addItem&&inventoryManager.editItems(parser.parseItems(e.addItem),"add"),void 0!==e.setItem&&inventoryManager.editItems(parser.parseItems(e.setItem),"set"),void 0!==e.setValue)for(o=e.setValue,t=0,s=o.length;s>t;t++)d=o[t],inventoryManager.setValue(d.path,parser.parseStatement(d.value.toString()));if(void 0!==e.increaseValue)for(u=e.increaseValue,n=0,r=u.length;r>n;n++)d=u[n],inventoryManager.increaseValue(d.path,parser.parseStatement(d.value.toString()));if(void 0!==e.decreaseValue){for(l=e.decreaseValue,p=[],i=0,a=l.length;a>i;i++)d=l[i],p.push(inventoryManager.decreaseValue(d.path,parser.parseStatement(d.value.toString())));return p}},SceneManager.prototype.readSounds=function(e,t){var n;return n=!1,void 0!==e.playSound&&(soundManager.playSound(e.playSound,!1),n=!0),t&&!n&&soundManager.playDefaultClickSound(),void 0!==e.startMusic&&soundManager.startMusic(e.startMusic),void 0!==e.stopMusic&&soundManager.stopMusic(e.stopMusic),void 0!==e.scrollSound?data.game.currentScene.scrollSound=e.scrollSound:data.game.settings.soundSettings.defaultScrollSound?data.game.currentScene.scrollSound=data.game.settings.soundSettings.defaultScrollSound:data.game.currentScene.scrollSound=void 0},SceneManager.prototype.readExecutes=function(source){return void 0!==source.executeJs?eval(source.executeJs):void 0},SceneManager.prototype.readMisc=function(e){return void 0!==e.skipEnabled?data.game.currentScene.skipEnabled=parser.parseStatement(e.skipEnabled):data.game.currentScene.skipEnabled=data.game.settings.scrollSettings.textSkipEnabled,void 0!==e.scrollSpeed?data.game.currentScene.scrollSpeed=e.scrollSpeed:data.game.currentScene.scrollSpeed=data.game.settings.scrollSettings.defaultScrollSpeed,void 0!==e.inventoryHidden?data.inventoryHidden=parser.parseStatement(e.inventoryHidden):data.inventoryHidden=!1},SceneManager.prototype.readSaving=function(e){return void 0!==e.saveGame&&gameManager.saveGame(),void 0!==e.loadGame?ui.showLoadNotification():void 0},SceneManager.prototype.readCheckpoints=function(e){var t,n,s,r,a,i,o,u,l,p;if(void 0!==e.saveCheckpoint){for(void 0===data.game.checkpoints&&(data.game.checkpoints=[]),n=!1,u=data.game.checkpoints,r=0,i=u.length;i>r;r++)s=u[r],s.name===e.saveCheckpoint&&(s.scene=data.game.currentScene.name,n=!0);n||(t={name:e.saveCheckpoint,scene:data.game.currentScene.name},data.game.checkpoints.push(t))}if(void 0!==e.loadCheckpoint){for(void 0===data.game.checkpoints&&(data.game.checkpoints=[]),l=data.game.checkpoints,p=[],a=0,o=l.length;o>a;a++)s=l[a],s.name===e.loadCheckpoint?p.push(this.changeScene(s.scene)):p.push(void 0);return p}},SceneManager.prototype.requirementsFilled=function(e){var t,n,s,r,a,i;for(r=[],void 0!==e.itemRequirement&&(a=parser.parseItems(e.itemRequirement),r.push(inventoryManager.checkRequirements(a))),void 0!==e.requirement&&r.push(inventoryManager.parseIfStatement(e.requirement)),i=!0,t=0,n=r.length;n>t;t++)s=r[t],s===!1&&(i=!1);return i},SceneManager}(),SoundManager=function(){function e(){}return e.prototype.playDefaultClickSound=function(e,t){return this.playSound(data.game.settings.soundSettings.defaultClickSound,!1)},e.prototype.playSound=function(e,t){var n,s,r,a,i;for(r=data.game.sounds,n=0,s=r.length;s>n;n++)if(a=r[n],a.name===e)return i=new Audio(gamePath+"/sounds/"+a.file),t?i.volume=data.game.settings.soundSettings.musicVolume:i.volume=data.game.settings.soundSettings.soundVolume,i.play(),i},e.prototype.isPlaying=function(e){var t,n,s,r;for(r=data.music,n=0,s=r.length;s>n;n++)return t=r[n],t.paused?!1:!0},e.prototype.startMusic=function(e){var t;return t=this.playSound(e,!0),t.addEventListener("ended",function(){this.currentTime=0,this.play()},!1),data.music.push({name:e,music:t})},e.prototype.stopMusic=function(e){var t,n,s,r,a,i;for(a=data.music,i=[],s=0,r=a.length;r>s;s++)t=a[s],e===t.name?(t.music.pause(),n=data.music.indexOf(t),i.push(data.music.splice(n,1))):i.push(void 0);return i},e}(),TextPrinter=function(){function TextPrinter(){}return TextPrinter.prototype.fullText="",TextPrinter.prototype.currentOffset=0,TextPrinter.prototype.defaultInterval=0,TextPrinter.prototype.soundBuffer=[],TextPrinter.prototype.musicBuffer=[],TextPrinter.prototype.stopMusicBuffer=[],TextPrinter.prototype.executeBuffer=[],TextPrinter.prototype.buffersExecuted=!1,TextPrinter.prototype.scrollSound=null,TextPrinter.prototype.tickSoundFrequency=1,TextPrinter.prototype.tickCounter=0,TextPrinter.prototype.tickSpeedMultiplier=1,TextPrinter.prototype.speedMod=!1,TextPrinter.prototype.pause=0,TextPrinter.prototype.interval=0,TextPrinter.prototype.printCompleted=!1,TextPrinter.prototype.printText=function(e,t){return this.printCompleted=!1,data.printedText="",null!==document.querySelector("#skip-button")&&(document.querySelector("#skip-button").disabled=!1),this.fullText=e,this.currentOffset=-1,this.soundBuffer=[],this.musicBuffer=[],this.stopMusicBuffer=[],this.executeBuffer=[],this.buffersExecuted=!1,t&&(this.buffersExecuted=!0),this.defaultInterval=data.game.currentScene.scrollSpeed,this.setTickSoundFrequency(this.defaultInterval),setTimeout(this.onTick(),this.defaultInterval)},TextPrinter.prototype.trySkip=function(){return data.game.currentScene.skipEnabled?this.complete():void 0},TextPrinter.prototype.complete=function(){var first,i,k,l,len,len1,len2,len3,m,o,q,ref,ref1,ref2,ref3,ref4,ref5,ref6,ref7,s,ss,t,u,v;if(this.printCompleted=!0,this.currentOffset=0,null!==document.querySelector("#skip-button")&&(document.querySelector("#skip-button").disabled=!0),!this.buffersExecuted){if(ss=[],first=!0,this.fullText.indexOf("play-sound")>-1)for(s=this.fullText.split("play-sound "),k=0,len=s.length;len>k;k++)i=s[k],first||ss.push(i.split(/\s|\"/)[0]),first=!1;if(ss.length>0)for(i=l=0,ref=ss.length;ref>=0?ref>=l:l>=ref;i=ref>=0?++l:--l)ref1=ss[i],indexOf.call(this.soundBuffer,ref1)>=0||soundManager.playSound(ss[i]);if(ss=[],first=!0,this.fullText.indexOf("play-music")>-1)for(s=this.fullText.split("play-music "),m=0,len1=s.length;len1>m;m++)i=s[m],first||ss.push(i.split(/\s|\"/)[0]),first=!1;if(ss.length>0)for(i=o=0,ref2=ss.length;ref2>=0?ref2>=o:o>=ref2;i=ref2>=0?++o:--o)ref3=ss[i],indexOf.call(this.musicBuffer,ref3)>=0||soundManager.startMusic(ss[i]);if(ss=[],first=!0,this.fullText.indexOf("stop-music")>-1)for(s=this.fullText.split("stop-music "),q=0,len2=s.length;len2>q;q++)i=s[q],first||ss.push(i.split(/\s|\"/)[0]),first=!1;if(ss.length>0)for(i=t=0,ref4=ss.length;ref4>=0?ref4>=t:t>=ref4;i=ref4>=0?++t:--t)ref5=ss[i],indexOf.call(this.stopMusicBuffer,ref5)>=0||soundManager.stopMusic(ss[i]);if(ss=[],first=!0,this.fullText.indexOf("execute-command")>-1)for(s=this.fullText.split("execute-command "),u=0,len3=s.length;len3>u;u++)i=s[u],first||ss.push(i.split(/\s|\"/)[0]),first=!1;if(ss.length>0)for(i=v=0,ref6=ss.length;ref6>=0?ref6>=v:v>=ref6;i=ref6>=0?++v:--v)ref7=ss[i],indexOf.call(this.executeBuffer,ref7)>=0||void 0===ss[i]||eval(data.parsedJavascriptCommands[parseInt(s.substring(4,s.length))]);this.buffersExecuted=!0}return data.printedText=this.fullText,sceneManager.updateChoices()},TextPrinter.prototype.unpause=function(){return null!==document.querySelector("#continue-button")&&(document.querySelector("#continue-button").style.display="none"),"input"===this.pause?this.pause=0:void 0},TextPrinter.prototype.fastScroll=function(){return data.game.currentScene.skipEnabled?this.tickSpeedMultiplier=data.game.settings.scrollSettings.fastScrollSpeedMultiplier:void 0},TextPrinter.prototype.stopFastScroll=function(){return this.tickSpeedMultiplier=1},TextPrinter.prototype.setTickSoundFrequency=function(e){var t;return t=data.game.settings.scrollSettings.tickFreqThreshold,this.tickSoundFrequency=1,2*t>=e&&(this.tickSoundFrequency=2),t>=e?this.tickSoundFrequency=3:void 0},TextPrinter.prototype.onTick=function(){var e;if("input"!==this.pause&&this.pause>0&&this.pause--,0===this.pause){if(this.speedMod||(this.interval=this.defaultInterval),0===this.defaultInterval)return void this.complete();if(data.printedText===this.fullText)return;for(e=!1;" "===this.fullText[this.currentOffset]||"<"===this.fullText[this.currentOffset]||">"===this.fullText[this.currentOffset];)this.readTags();if(data.printedText=this.fullText.substring(0,this.currentOffset),e||this.currentOffset++,this.currentOffset>=this.fullText.length)return void this.complete();this.tickCounter++,this.tickCounter>=this.tickSoundFrequency&&"none"!==this.scrollSound&&0!==this.interval&&(null!==this.scrollSound?soundManager.playSound(this.scrollSound):void 0!==data.game.currentScene.scrollSound&&soundManager.playSound(data.game.currentScene.scrollSound),this.tickCounter=0)}return this.setTickSoundFrequency(this.interval/this.tickSpeedMultiplier),setTimeout(function(){textPrinter.onTick()},this.interval/this.tickSpeedMultiplier)},TextPrinter.prototype.readTags=function(){var disp,i,s,spans,str;if(" "===this.fullText[this.currentOffset]&&this.currentOffset++,">"===this.fullText[this.currentOffset]&&this.currentOffset++,"<"===this.fullText[this.currentOffset]){for(i=this.currentOffset,str="",i++;">"!==this.fullText[i-1]&&"<"!==this.fullText[i];)str+=this.fullText[i],i++;if(str=str.substring(1,str.length),str.indexOf("display:none;")>-1){for(disp="",spans=1;;)if(i++,disp+=this.fullText[i],-1!==disp.indexOf("/span")?(spans--,disp=""):-1!==disp.indexOf("span")&&(spans++,disp=""),0===spans)break;i++}return str.indexOf("play-sound")>-1&&str.indexOf("display:none;")>-1&&(s=str.split("play-sound "),s=s[1].split(/\s|\"/)[0],this.soundBuffer.push(s)),str.indexOf("play-music")>-1&&str.indexOf("display:none;")>-1&&(s=str.split("play-music "),s=s[1].split(/\s|\"/)[0],this.musicBuffer.push(s)),str.indexOf("stop-music")>-1&&str.indexOf("display:none;")>-1&&(s=str.split("stop-music "),s=s[1].split(/\s|\"/)[0],this.stopMusicBuffer.push(s)),str.indexOf("execute-command")>-1&&str.indexOf("display:none;")>-1&&(s=str.split("execute-command "),s=s[1].split(/\s|\"/)[0],this.executeBuffer.push(s)),-1===str.indexOf("display:none;")&&(str.indexOf("play-sound")>-1&&(s=str.split("play-sound "),s=s[1].split(/\s|\"/)[0],this.soundBuffer.push(s),soundManager.playSound(s)),str.indexOf("play-music")>-1&&(s=str.split("play-music "),s=s[1].split(/\s|\"/)[0],this.musicBuffer.push(s),soundManager.startMusic(s)),str.indexOf("stop-music")>-1&&(s=str.split("stop-music "),s=s[1].split(/\s|\"/)[0],this.stopMusicBuffer.push(s),soundManager.stopMusic(s)),str.indexOf("pause")>-1&&(s=str.split("pause "),s=s[1].split(/\s|\"/)[0],this.pause=s,null!==document.querySelector("#continue-button")&&(document.querySelector("#continue-button").style.display="inline")),str.indexOf("execute-command")>-1&&(s=str.split("execute-command "),s=s[1].split(/\s|\"/)[0],this.executeBuffer.push(s),void 0!==s&&eval(data.parsedJavascriptCommands[parseInt(s.substring(4,s.length))])),str.indexOf("set-speed")>-1&&(s=str.split("set-speed "),s=s[1].split(/\s|\"/)[0],this.interval=parser.parseStatement(s),this.speedMod=!0),str.indexOf("default-speed")>-1&&(this.interval=this.defaultInterval,this.speedMod=!1),str.indexOf("set-scroll-sound")>-1&&(s=str.split("set-scroll-sound "),s=s[1].split(/\s|\"/)[0],this.scrollSound=s),str.indexOf("default-scroll-sound")>-1&&(this.scrollSound=null)),this.currentOffset=i,this.offsetChanged=!0}},TextPrinter}(),UI=function(){function e(){}return e.prototype.showSaveNotification=function(e){var t,n;return t=document.getElementById("save-notification"),n=t.querySelectorAll("textarea"),n[0].value=e,t.style.display="block"},e.prototype.closeSaveNotification=function(){var e;return e=document.getElementById("save-notification"),e.style.display="none"},e.prototype.showLoadNotification=function(){var e;return"text"===gameArea.game.settings.saveMode?(e=document.getElementById("load-notification"),e.style.display="block"):gameManager.loadGame()},e.prototype.closeLoadNotification=function(e){var t,n;return t=document.getElementById("load-notification"),e&&(n=t.querySelectorAll("textarea"),gameManager.loadGame(n[0].value),n[0].value=""),t.style.display="none"},e.prototype.updateInputs=function(e){var t,n,s,r,a,i;for(s=document.getElementById("game-area").querySelectorAll("input"),i=[],r=0,a=s.length;a>r;r++)n=s[r],i.push(function(){var s,r,a,i;for(a=data.game.inventory,i=[],s=0,r=a.length;r>s;s++)t=a[s],t.name===n.className.substring(6,n.className.length)?(t.value=util.stripHTML(n.value),e?i.push(sceneManager.updateScene(data.game.currentScene,!0)):i.push(void 0)):i.push(void 0);return i}());return i},e}(),copyButton=document.querySelector("#copy-button"),null!==copyButton&&copyButton.addEventListener("click",function(e){var t,n,s,r;t=document.getElementById("save-notification").querySelector("textarea"),t.select();try{r=document.execCommand("copy")}catch(s){n=s,console.error("Copying to clipboard failed: "+n)}}),Util=function(){function e(){}return e.prototype.isEven=function(e){return e%2===0},e.prototype.isOdd=function(e){return 1===Math.abs(e%2)},e.prototype.stripHTML=function(e){var t;return t=/(<([^>]+)>)/gi,e.replace(t,"")},e.prototype.validateParentheses=function(e){var t,n,s,r;for(r=0,n=0,s=e.length;s>n;n++)if(t=e[n],"("===t&&r++,")"===t){if(!(r>0))return!1;r--}return 0===r?!0:!1},e}(),data={game:null,choices:null,debugMode:!1,inventoryHidden:!1,printedText:"",parsedJavascriptCommands:[],music:[]},gamePath="./game",gameManager=new GameManager,inputManager=new InputManager,inventoryManager=new InventoryManager,parser=new Parser,sceneManager=new SceneManager,soundManager=new SoundManager,textPrinter=new TextPrinter,ui=new UI,util=new Util,gameArea=new Vue({el:"#game-area",data:data,methods:{requirementsFilled:function(e){return sceneManager.requirementsFilled(e)},textSkipEnabled:function(e){return data.game.currentScene.skipEnabled&&data.game.settings.skipButtonShown},itemsOverZeroAndAreHidden:function(e){var t,n,s,r;for(r=data.game.inventory,n=0,s=r.length;s>n;n++)if(t=r[n],t.name===e.name&&t.hidden&&void 0!==t.hidden){if(t.value>0)return!0;if(isNaN(t.value))return!0}return!1},itemsOverZeroAndNotHidden:function(e){var t,n,s,r;for(r=data.game.inventory,n=0,s=r.length;s>n;n++)if(t=r[n],t.name===e.name&&(!t.hidden||void 0===t.hidden)){if(t.value>0)return!0;if(isNaN(t.value))return!0}return!1},itemsOverZeroAndHidden:function(e){return inventoryManager.itemsOverZero(e)&&inventoryManager.itemHidden(e)},selectChoice:function(e){return sceneManager.selectChoice(e)}}}),gameManager.startGame();