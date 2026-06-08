(()=>{var D=class{get _savedCompletionProgress(){return r._cfg?.apiWorker?.completionProgress??{}}get SAVED_COMPLETION_PROGRESS(){let e=this._savedCompletionProgress;return!e?.Total||r._cfg.apiWorker.targetUser!==r.targetUser?this.updateCompletionProgress({batchSize:500}).then(()=>this._savedCompletionProgress):this.updateCompletionProgress({batchSize:20,savedArray:e.Results}).then(()=>this._savedCompletionProgress)}set SAVED_COMPLETION_PROGRESS(e){e.Results=e.Results.map(t=>(delete t.ConsoleName,delete t.NumLeaderboards,t)),r._cfg.apiWorker||(r._cfg.apiWorker={}),r._cfg.apiWorker.targetUser=r.targetUser,r._cfg.apiWorker.completionProgress=e,r.writeConfiguration()}baseUrl="https://retroachievements.org/API/";endpoints={userProfile:"API_GetUserProfile.php",gameProgress:"API_GetGameInfoAndUserProgress.php",recentAchieves:"API_GetUserRecentAchievements.php",gameInfo:"API_GetGame.php",extendedGameInfo:"API_GetGameExtended.php",recentlyPlayedGames:"API_GetUserRecentlyPlayedGames.php",userAwards:"API_GetUserAwards.php",userGameRankAndScore:"API_GetUserGameRankAndScore.php",completionProgress:"API_GetUserCompletionProgress.php",gameList:"API_GetGameList.php",userSummary:"API_GetUserSummary.php"};getUrl({endpoint:e,targetUser:t,gameID:s,minutes:a,apiKey:i,userName:o,achievesCount:d,count:l,offset:p}){let c=new URL(e,this.baseUrl),h={y:i||r.API_KEY,z:o||r.USER_NAME,u:t||r.targetUser,g:s||r.gameID,m:a||2e3,i:s||r.gameID,f:1,h:1,a:d||5,c:l||20,o:p||0};return c.search=new URLSearchParams(h),c}constructor(){}getUserGameRank({targetUser:e,gameID:t}){let s=this.getUrl({endpoint:this.endpoints.userRankAndScore});return fetch(s).then(a=>a.json())}getProfileInfo({targetUser:e}){let t=this.getUrl({targetUser:e,endpoint:this.endpoints.userProfile});return fetch(t).then(s=>s.json())}getUserCompelitionProgress({targetUser:e,count:t,offset:s}){let a=this.getUrl({targetUser:e||r.targetUser,count:t||100,offset:s||0,endpoint:this.endpoints.completionProgress});return fetch(a).then(i=>i.json()).then(i=>(i.Results=i.Results.map(o=>(o.ID=o.GameID,o.NumAchievements=o.MaxPossible,delete o.MaxPossible,delete o.NumLeaderboards,o)),i))}getUserAwards({targetUser:e}){let t=this.getUrl({targetUser:e||r.targetUser,endpoint:this.endpoints.userAwards});return fetch(t).then(s=>s.json()).then(s=>(s.VisibleUserAwards=s.VisibleUserAwards.map(a=>(a.award=a.AwardType=="Game Beaten"?a.AwardDataExtra=="1"?"beaten":"beaten_softcore":a.AwardDataExtra=="1"?"mastered":"completed",a.DateEarned=a.AwardedAt,a.ConsoleName=="Events"&&(a.award="event"),a.timeString=this.toLocalTimeString(a.AwardedAt),a=this.fixGameTitle(a),a)),s))}getGameProgress({targetUser:e,gameID:t}){let s=this.getUrl({endpoint:this.endpoints.gameProgress,targetUser:e||r.targetUser,gameID:t||r.gameID});return fetch(s).then(a=>a.json()).then(a=>{a={...a,TotalRealPlayers:0,TotalRetropoints:0,points_total:0,progressionRetroRatio:0,beatenCount:1/0,masteredCount:1/0,earnedStats:{soft:{count:0,points:0,retropoints:0},hard:{count:0,points:0,retropoints:0}}};let i={Count:0,WinCount:0,WinAwardedCount:0,WinEarnedCount:0},o={isBeaten:!0,isBeatenSoftcore:!0,isWinEarned:!1,isWinEarnedSoftcore:!1};for(let l of Object.values(a.Achievements))a.TotalRetropoints+=l.TrueRatio,a.points_total+=l.Points,a.TotalRealPlayers<l.NumAwarded&&(a.TotalRealPlayers=l.NumAwarded),l.DateEarned&&(a.earnedStats.soft.count+=1,a.earnedStats.soft.points+=l.Points,a.earnedStats.soft.retropoints+=l.TrueRatio),l.DateEarnedHardcore&&(a.earnedStats.hard.count+=1,a.earnedStats.hard.points+=l.Points,a.earnedStats.hard.retropoints+=l.TrueRatio),l.type==="progression"&&(i.Count++,l.DateEarned?l.DateEarnedHardcore||(o.isBeaten=!1):(o.isBeaten=!1,o.isBeatenSoftcore=!1),a.beatenCount>l.NumAwardedHardcore&&(a.beatenCount=l.NumAwardedHardcore)),l.type==="win_condition"&&(l.DateEarnedHardcore?(o.isWinEarned=!0,o.isWinEarnedSoftcore=!0):l.DateEarned&&(o.isWinEarnedSoftcore=!0),i.WinCount++,l.NumAwardedHardcore>i.WinAwardedCount&&(i.WinAwardedCount=l.NumAwardedHardcore),l.DateEarnedHardcore&&i.WinEarnedCount++),l.NumAwardedHardcore<a.masteredCount&&(a.masteredCount=l.NumAwardedHardcore);a.achievements_published==a.NumAwardedToUserHardcore?a.award="mastered":o.isBeaten&&(o.isWinEarned||i.WinCount==0)&&(a.award="beaten"),a={...a,winVariantCount:i.WinCount,winEarnedCount:i.WinEarnedCount,progressionSteps:i.WinCount>0?i.Count+1:i.Count},i.WinCount>0&&(a.beatenCount=i.WinAwardedCount),a.beatenCount!=1/0&&(a.beatenRate=~~(1e4*a.beatenCount/a.TotalRealPlayers)/100),a.masteredCount!=1/0&&(a.masteryRate=~~(1e4*a.masteredCount/a.TotalRealPlayers)/100);let d=~~(a.TotalRetropoints/a.points_total*100)/100;return a.retroRatio=d,a.gameDifficulty=d>9?"insane":d>7?"expert":d>5?"pro":d>3?"standard":"easy",Object.values(a.Achievements).map(l=>this.fixAchievement(l,a)),a=this.fixGameTitle(a),a})}getRecentAchieves({targetUser:e,minutes:t}){let s=this.getUrl({endpoint:this.endpoints.recentAchieves,targetUser:e,minutes:t});return fetch(s).then(a=>a.json()).then(a=>a.map(i=>(i.Date=this.toLocalTimeString(i.Date),i)))}getGameInfo({gameID:e,extended:t}){let s=this.getUrl({endpoint:this.endpoints[t?"extendedGameInfo":"gameInfo"],gameID:e});return fetch(s).then(a=>a.json())}getRecentlyPlayedGames({targetUser:e,count:t}){let s=this.getUrl({endpoint:this.endpoints.recentlyPlayedGames,targetUser:e,count:t||50});return fetch(s).then(a=>a.json()).then(a=>a.map((i,o)=>(i.ID=i.GameID,i.Points=i.ScoreAchievedHardcore+"/"+i.PossibleScore,i.NumAchievements=i.NumAchievedHardcore+"/"+i.AchievementsTotal,i.NumLeaderboards="",i.DateEarnedHardcore=i.LastPlayed,this.fixGameTitle(i))))}getUserProfile({userName:e}){let t=this.getUrl({targetUser:e,userName:e,endpoint:this.endpoints.userProfile});return fetch(t).then(s=>s.json())}getUserSummary({targetUser:e,gamesCount:t=3,achievesCount:s}){let a=this.getUrl({targetUser:e,gameID:t,achievesCount:s,endpoint:this.endpoints.userSummary});return fetch(a).then(i=>i.json()).then(i=>(i.RecentlyPlayed=i.RecentlyPlayed.map(o=>(o.LastPlayed=this.toLocalTimeString(o.LastPlayed),i.Awarded[o.GameID]&&(o={...o,...i.Awarded[o.GameID]}),o=this.fixGameTitle(o),o)),i.RecentAchievements=Object.values(i.RecentAchievements).flatMap(o=>Object.values(o)).map(o=>(o.DateEarned=this.toLocalTimeString(o.DateAwarded),o)),i.isInGame=new Date-new Date(i.RecentlyPlayed[0].LastPlayed)<300*1e3,i))}verifyUserIdent({userName:e,apiKey:t}){let s=this.getUrl({targetUser:e,userName:e,apiKey:t,endpoint:this.endpoints.userProfile});return fetch(s).then(a=>a.json())}getGameList({userName:e,apiKey:t,systemID:s}){let a=this.getUrl({userName:e,apiKey:t,gameID:s,endpoint:this.endpoints.gameList});return fetch(a).then(i=>i.json())}doTestEndpoint({endpoint:e}){let t=this.getUrl({endpoint:e});return fetch(t).then(s=>s.json()).then(s=>console.log(s))}async updateCompletionProgress({savedArray:e=[],completionProgress:t=[],batchSize:s=500}){let a=await this.getUserCompelitionProgress({count:s,offset:t.length});t=[...t,...a.Results];let i=t.at(-1);if(e.findIndex(d=>d.hasOwnProperty("GameID")&&d.GameID===i.GameID&&d.MostRecentAwardedDate===i.MostRecentAwardedDate)>=0||t.length===a.Total){let d=t.map(l=>l.GameID);e=e.filter(l=>!d.includes(l.GameID)),e=[...t,...e],this.SAVED_COMPLETION_PROGRESS={Total:e.length,Results:e}}else setTimeout(()=>this.updateCompletionProgress({savedArray:e,completionProgress:t,batchSize:s}),100)}fixAchievement(e,t){let{BadgeName:s,DateEarned:a,DateEarnedHardcore:i,NumAwardedHardcore:o,NumAwarded:d,TrueRatio:l,ID:p}=e,{NumDistinctPlayers:c,NumAwardedToUserHardcore:h,TotalRealPlayers:$}=t,y=100*(o-h*.5)/((c+$)*.5-h*.5);t.Achievements[p]={...e,totalPlayers:c,isEarned:!!a,isHardcoreEarned:!!i,DateEarned:a&&this.toLocalTimeString(a),DateEarnedHardcore:i&&this.toLocalTimeString(i),prevSrc:`https://media.retroachievements.org/Badge/${s}.png`,rateEarned:~~(100*d/c)+"%",rateEarnedHardcore:~~(100*o/c)+"%",trend:y,difficulty:y<1.5&&l>300||l>=500?"hell":y<=3&&l>100||l>=300?"insane":y<8&&l>24?"expert":y<13&&l>10?"pro":y<20&&l>5||l>10?"standard":"easy"}}fixGameTitle(e){let t=[/\[SUBSET[^\[]*\]/gi,/~[^~]*~/g,".HACK//"],s=e.Title,a=t.reduce((i,o)=>{let d=new RegExp(o,"gi"),l=e.Title.match(d);return l&&l.forEach(p=>{s=s.replace(p,"");let c=p;i.push(c.replace(/[~\.\[\]]|subset -|\/\//gi,""))}),i},[]);return e.badges=a,e.FixedTitle=s.trim(),e}toLocalTimeString(e){!/(\+00\:00$)|(z$)/gi.test(e)&&(e+="+00:00");let s=new Date(e),a={day:"2-digit",month:"2-digit",year:"numeric",hour:"2-digit",minute:"2-digit",hour12:!1};return s}async rawgSearchGame({gameTitle:e,platformID:t}){e=e.split("|")[0];let s=V[t];if(!s)return!1;let a="https://api.rawg.io/api/",i="games",o=new URL(i,a),d={search:e,platforms:s,key:"179353905bcb491d975b1fc03b3c8bd6"};o.search=new URLSearchParams(d);try{let l=await fetch(o);if(!l.ok)return console.log(`HTTP error! status: ${l.status}`),!1;let p=await l.json(),c=p.results?p.results[0]:null,h=e.replace(/[^a-z0-9]/gi," ").trim(),$=c?.name.replace(/[^a-z0-9]/gi," ").trim()??"";if(!c||h!==$)return console.log(`Game not found for title: ${e} on platform: ${t}`),!1;let y=["name","playtime","released","background_image","rating","ratings","added","metacritic","score","community_rating","genres"];return Object.fromEntries(Object.entries(c).filter(([q])=>y.includes(q)))}catch(l){return console.log(`Fetch error: ${l.message}`),!1}}},V={1:167,2:83,3:79,4:26,5:24,6:43,7:49,8:null,9:119,10:117,11:74,12:27,13:46,14:null,15:77,17:112,18:9,21:15,23:null,24:null,25:23,27:12,28:null,29:null,33:null,37:null,38:41,39:107,40:106,41:17,43:111,44:null,45:null,46:null,47:null,49:null,51:28,53:null,56:null,57:null,63:null,69:null,71:null,72:null,73:null,74:null,75:null,76:null,77:null,78:13,80:null,101:null,102:null};var P="retroApiConfig",I=class{get version(){return this._cfg.version??"0"}set version(e){this._cfg.version=e,this.writeConfiguration()}get API_KEY(){return this._cfg.identification.RAApi_key}set API_KEY(e){this._cfg.identification.RAApi_key=e,this.writeConfiguration()}get USER_NAME(){return this._cfg.identification.RAApi_login}set USER_NAME(e){this._cfg.identification.RAApi_login=e,this.writeConfiguration()}get identConfirmed(){return this._cfg.identification.identConfirmed??!1}set identConfirmed(e){this._cfg.identification.identConfirmed=e,this.writeConfiguration()}get userImageSrc(){return this._cfg.identification.userImageSrc||""}set userImageSrc(e){this._cfg.identification.userImageSrc=e,this.ui.buttons&&(ui.buttons.userImage.src=e),this.writeConfiguration()}get targetUser(){return this._cfg.settings.targetUser||this.USER_NAME}set targetUser(e){this._cfg.settings.targetUser=e,this.writeConfiguration(),this.identConfirmed&&(ui.settings.getLastGameID(),ui.awards.updateAwards())}get gameID(){return this._cfg.settings.gameID}set gameID(e){this._cfg.settings.gameID=e,this.writeConfiguration()}get ui(){return this._cfg.ui}constructor(){this.readConfiguration()}readConfiguration(){let e=JSON.parse(localStorage.getItem(P));e||(e={identification:{RAApi_key:"",RAApi_login:""},settings:{updateDelay:15,sort:"default",gameID:1},ui:{}}),this._cfg=e,localStorage.setItem(P,JSON.stringify(this._cfg)),this.writeConfiguration()}delayedWrite;writeConfiguration(){clearTimeout(this.delayedWrite),this.delayedWrite=setTimeout(()=>{localStorage.setItem(P,JSON.stringify(this._cfg))},1e3)}};function w(n){return n?.reduce((e,t)=>e+=`<i class="game-badge game-badge__${t.toLowerCase()}">${t}</i>`,"")}var g={date:(n,e)=>{let t=n.DateEarned?new Date(n.DateEarnedHardcore?n.DateEarnedHardcore:n.DateEarned):-1/0;return(e.DateEarned?new Date(e.DateEarnedHardcore?e.DateEarnedHardcore:e.DateEarned):-1/0)-t},earnedCount:(n,e)=>e.NumAwardedHardcore-n.NumAwardedHardcore,points:(n,e)=>parseInt(n.Points)-parseInt(e.Points),truepoints:(n,e)=>n.TrueRatio-e.TrueRatio,default:(n,e)=>n.DisplayOrder===0?g.id(n,e):n.DisplayOrder-e.DisplayOrder,id:(n,e)=>n.ID-e.ID,disable:(n,e)=>0,achievementsCount:(n,e)=>parseInt(n.NumAchievements)-parseInt(e.NumAchievements),title:(n,e)=>{let t=n.Title?.toUpperCase()??n.FixedTitle.toUpperCase(),s=e.Title?.toUpperCase()??e.FixedTitle.toUpperCase();return t<s?-1:t>s?1:0},award:(n,e)=>{let t={event:6,mastered:5,"beaten-hardcore":4,completed:3,"beaten-softcore":2,started:1},s=t[e.award]??0,a=t[n.award]??0,i=new Date(e.AwardedAt),o=new Date(n.AwardedAt);return s-a!=0?s-a:i-o}};var G={points:`
        <svg style="bottom:-5px" fill="#a33fff" version="1.1" id="Capa_1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="14px" height="12px" viewBox="20 20 401.601 401.6" xml:space="preserve" stroke="#6b1be4">
            <g id="SVGRepo_bgCarrier" stroke-width="0"/>
            <g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"/>
            <g id="SVGRepo_iconCarrier"> <g> <g> <path d="M116.682,229.329c11.286,0,22.195-0.729,32.518-2.086V114.094c-10.322-1.356-21.232-2.085-32.518-2.085 c-64.441,0-116.681,23.693-116.681,52.921v11.477C0.001,205.634,52.241,229.329,116.682,229.329z"/> <path d="M116.682,288.411c11.286,0,22.195-0.729,32.518-2.084v-33.166c-10.325,1.356-21.229,2.095-32.518,2.095 c-56.25,0-103.199-18.054-114.227-42.082c-1.606,3.5-2.454,7.124-2.454,10.839v11.477 C0.001,264.718,52.241,288.411,116.682,288.411z"/> <path d="M149.199,314.823v-2.578c-10.325,1.356-21.229,2.095-32.518,2.095c-56.25,0-103.199-18.054-114.227-42.082 C0.848,275.757,0,279.381,0,283.096v11.477c0,29.229,52.24,52.922,116.681,52.922c12.887,0,25.282-0.95,36.873-2.7 c-2.873-5.877-4.355-12.075-4.355-18.496V314.823z"/> <path d="M284.92,22.379c-64.441,0-116.681,23.693-116.681,52.921v11.477c0,29.228,52.24,52.921,116.681,52.921 c64.44,0,116.681-23.693,116.681-52.921V75.3C401.601,46.072,349.36,22.379,284.92,22.379z"/> <path d="M284.92,165.626c-56.25,0-103.199-18.053-114.227-42.082c-1.606,3.499-2.454,7.123-2.454,10.839v11.477 c0,29.228,52.24,52.921,116.681,52.921c64.44,0,116.681-23.693,116.681-52.921v-11.477c0-3.716-0.848-7.34-2.454-10.839 C388.119,147.573,341.17,165.626,284.92,165.626z"/> <path d="M284.92,224.71c-56.25,0-103.199-18.054-114.227-42.082c-1.606,3.499-2.454,7.123-2.454,10.839v11.477 c0,29.229,52.24,52.922,116.681,52.922c64.44,0,116.681-23.693,116.681-52.922v-11.477c0-3.716-0.848-7.34-2.454-10.839 C388.119,206.657,341.17,224.71,284.92,224.71z"/> <path d="M284.92,286.983c-56.25,0-103.199-18.054-114.227-42.082c-1.606,3.5-2.454,7.123-2.454,10.838v11.478 c0,29.228,52.24,52.921,116.681,52.921c64.44,0,116.681-23.693,116.681-52.921v-11.478c0-3.715-0.848-7.34-2.454-10.838 C388.119,268.928,341.17,286.983,284.92,286.983z"/> <path d="M284.92,346.066c-56.25,0-103.199-18.053-114.227-42.081c-1.606,3.5-2.454,7.125-2.454,10.838V326.3 c0,29.228,52.24,52.921,116.681,52.921c64.44,0,116.681-23.693,116.681-52.921v-11.478c0-3.715-0.848-7.34-2.454-10.838 C388.119,328.012,341.17,346.066,284.92,346.066z"/> </g> </g> </g>

        </svg>`};function A(n){return new Date(n).toLocaleString()}var m,C=class{constructor(){this.update()}async update(){if(ui.showLoader(),m){let e=this.HomeSection();ui.content.innerHTML="",ui.content.append(e),ui.removeLoader()}else await this.loadUserInfo(),this.update()}async loadUserInfo(){let e=await _.getUserSummary({gamesCount:5,achievesCount:8});console.log(e),m={userName:e.User,status:e.Status?.toLowerCase(),richPresence:e.RichPresenceMsg,memberSince:e.MemberSince,userImageSrc:`https://media.retroachievements.org${e.UserPic}`,userRank:e.Rank?`Rank: ${e.Rank} (Top ${~~(1e4*e.Rank/e.TotalRanked)/100}%)`:"Rank is unavailable",softpoints:e.TotalSoftcorePoints,retropoints:e.TotalTruePoints,hardpoints:e.TotalPoints,lastGames:e.RecentlyPlayed,lastAchievements:Object.values(e.RecentAchievements).map(t=>(t.DateEarnedHardcore=t.DateAwarded,t)).sort((t,s)=>g.date(t,s)),isInGame:e.isInGame}}HomeSection(){let e=document.createElement("section");return e.classList.add("home__section","section"),e.innerHTML=`
      ${this.headerHtml()}
      <div class="user-info__container">
      
        <ul class="user-info__last-games-list">
        <h2 class="user-info__block-header">Last cheevos</h2>
          ${m.lastAchievements.reduce((t,s)=>{let a=this.achievementHtml(s);return t+=a,t},"")}
        </ul>
        <ul class="user-info__last-games-list">
          <h2 class="user-info__block-header">Recently played</h2>
          ${m.lastGames.reduce((t,s)=>{let a=this.gameHtml(s);return t+=a,t},"")}
        </ul>
        
      </div>
    `,e}headerHtml(){let e=+(m.retropoints/m.hardpoints).toFixed(2);return`
      <div class="section__header-container user-info__header-container">
        <div class="user-info__header">
            <div class="user-info__avatar-container">
                <img src="${m.userImageSrc}" alt="" class="user-info__avatar" onclick="ui.goto.login()">
                ${e?`<span class="game-header__retro-ratio  achiv-rarity__standard">${e}</span>`:""}
            </div>
            <button class="button__switch-mode ${ui.isSoftmode?"softmode":""}" onclick="ui.switchGameMode()">${ui.isSoftmode?"SOFT":"HARD"}</button>
            <div class="user-info__user-name-container">
                <h1 class="user-info__user-name">${m.userName}</h1>
                <div class="user-info__user-rank">${m.userRank}</div>
                <div class="user-info__rich-presence">Member since: ${new Date(m.memberSince).toLocaleDateString()}</div>
            </div>
        </div>
        ${m.isInGame?`
        <div class="user-info__rich-presence"> ${m.richPresence}</div>
        `:""}
        ${this.pointsHtml()}
        
      </div>
    `}pointsHtml(){return`
        <div class="user-info__points-container">
          ${m.softpoints>0?`
            <div class="user-info__points-group">
              <h3 class="user-info__points-name">softpoints</h3>
              <p class="user-info__points">${m.softpoints}</p>
            </div>
            <div class="vertical-line"></div>
          `:""}
            <div class="user-info__points-group">
                <h3 class="user-info__points-name">hardpoints</h3>
                <p class="user-info__points">${m.hardpoints}</p>

            </div>
            <div class="vertical-line"></div>
            <div class="user-info__points-group">
                <h3 class="user-info__points-name">retropoints</h3>
                <p class="user-info__points">${m.retropoints}</p>

            </div>
        </div>
    `}gameHtml(e){return`    
      <li class="user-info__last-game-container" data-id="${e.GameID}">
          <div class="user-info__game-main-info"  onclick="ui.showGameDetails(${e.GameID}); event.stopPropagation()">
              <div class="user-info__game-preview-container" onclick="ui.goto.game(${e.GameID}); event.stopPropagation()">
                  <img class="user-info__game-preview" src="https://media.retroachievements.org${e.ImageIcon}" alt="">
              </div>


              <div class="user-info__game-description" >
                  <h2 class="user-info__game-title">${e.FixedTitle} ${w(e.badges)}</h2>
                  <div class="game-stats__text">${A(e.LastPlayed)} | ${e.ConsoleName}</div>
                  <div  class="game-stats__button"  onclick="ui.expandGameItem(${e.GameID},this); event.stopPropagation()">
                    <i class="game-stats__icon game-stats__expand-icon"></i>
                  </div>
                  <div class="user-info_game-stats-container">
                      <div class="game-stats ">
                        <i class="game-stats__icon game-stats__achivs-icon"></i>
                        <div class="game-stats__text">${ui.isSoftmode?e.NumAchieved:e.NumAchievedHardcore} / ${e.NumPossibleAchievements}</div>
                        </div>
                        <div class="game-stats game-stats__points">
                        <i class="game-stats__icon game-stats__points-icon"></i>
                        <div class="game-stats__text">${ui.isSoftmode?e.ScoreAchieved:e.ScoreAchievedHardcore} / ${e.PossibleScore}</div>
                        
                      </div>
                       
                  </div>
              </div>
          </div>
      </li>
        `}achievementHtml(e){return`
      <li class="user-info__cheevo-container">
        <div class="user-info__cheevo-title-container" 
           onclick="ui.showAchivDetails(${e.ID}, ${e.GameID}); event.stopPropagation()">
            <div class="user-info__cheevo-preview-container">
                <img class="user-info__cheevo-preview ${e.HardcoreAchieved||ui.isSoftmode&&e.IsAwarded?"earned":""}"
                    src="https://media.retroachievements.org/Badge/${e.BadgeName}.png" alt="">
            </div>

            <div class="user-info__cheevo-description">
                <h2 class="user-info__cheevo-title">${e.Title}</h2>
                <p class="user-info__cheevo-description">${e.Description}</p>
            <div class="user-info__cheevo-stats-container">
                <p class="user-info__cheevo-stats-text">
                ${G.points} ${e.Points} Points</p>
                <p class="game-stats__text cheevo-stats__unlocked">${z(e.DateEarned)}</p>
            </div>
          </div>
        </div>
        
      </li>
    
    `}},z=n=>{let e=new Date(n),t=e.getTime(),s=Date.now(),a=Math.round((s-e)/6e4);if(a<2)return"just now";if(a<60)return a+" minutes ago";let i=Math.round(a/60);return i<24?i+" hours ago":e.toLocaleString()};var S=n=>new Promise(e=>setTimeout(e,n));function b({list:n,items:e,callback:t}){let s=document.createElement("div");s.classList.add("lazy-load_trigger"),n.appendChild(s);let a=0,i=40,o=c=>{for(let h=0;h<c&&a<e.length;h++)n.appendChild(t(e[a++]))};o(i);let d=(c,h)=>{c.forEach($=>{$.isIntersecting&&(o(i),h.unobserve(s),a<e.length?(n.appendChild(s),h.observe(s)):s.remove())})},l={root:null,rootMargin:"0px",threshold:1};new IntersectionObserver(d,l).observe(s)}var f={1:"Genesis/Mega Drive",2:"Nintendo 64",3:"SNES/Super Famicom",4:"Game Boy",5:"Game Boy Advance",6:"Game Boy Color",7:"NES/Famicom",8:"PC Engine/TurboGrafx-16",9:"Sega CD",10:"32X",11:"Master System",12:"PlayStation",13:"Atari Lynx",14:"Neo Geo Pocket",15:"Game Gear",17:"Atari Jaguar",18:"Nintendo DS",21:"PlayStation 2",23:"Magnavox Odyssey 2",24:"Pokemon Mini",25:"Atari 2600",27:"Arcade",28:"Virtual Boy",29:"MSX",33:"SG-1000",37:"Amstrad CPC",38:"Apple II",39:"Saturn",40:"Dreamcast",41:"PlayStation Portable",43:"3DO Interactive Multiplayer",44:"ColecoVision",45:"Intellivision",46:"Vectrex",47:"PC-8000/8800",49:"PC-FX",51:"Atari 7800",53:"WonderSwan",56:"Neo Geo CD",57:"Fairchild Channel F",63:"Watara Supervision",69:"Mega Duck",71:"Arduboy",72:"WASM-4",73:"Arcadia 2001",74:"Interton VC 4000",75:"Elektor TV Games Computer",76:"PC Engine CD/TurboGrafx-CD",77:"Atari Jaguar CD",78:"Nintendo DSi",80:"Uzebox",101:"Events",102:"Standalone"};var T,x=class{awardTypeContext=()=>({label:"Filter by type",elements:[{label:`All (${T.VisibleUserAwards.length})`,id:"filter_all",type:"radio",onChange:"ui.awards.awardFilter = 'award'",checked:this.awardFilterName==="award",name:"filter-by-award"},...Object.getOwnPropertyNames(this.awardTypes).reduce((e,t)=>{let s={label:`${this.awardTypes[t].name} (${this.awardTypes[t].count})`,id:`filter_code-${t}`,type:"radio",onChange:`ui.awards.awardFilter = '${t}'`,checked:this.awardFilterName==t,name:"filter-by-award"};return e.push(s),e},[])]});awardPlatformContext=()=>({label:"Filter by platform",elements:[{label:`All (${T.VisibleUserAwards.length})`,id:"filter_all",type:"radio",onChange:"ui.awards.platformFilterCode = 'platform'",checked:this.platformFilterName==="platform",name:"filter-by-platform"},...Object.getOwnPropertyNames(this.platformCodes).reduce((e,t)=>{let s={label:`${this.platformCodes[t].name} (${this.platformCodes[t].count})`,id:`filter_code-${t}`,type:"radio",onChange:`ui.awards.platformFilterCode = ${t}`,checked:this.platformFilterCode==t,name:"filter-by-platform"};return e.push(s),e},[])]});awardSortContext=()=>({label:"Sort by",elements:[{label:"Date earned",id:"sort_date-earned",type:"radio",onChange:"ui.awards.awardSortType = 'date'",checked:this.awardSortType==="date",name:"sort-awards"},{label:"Type",id:"sort_award-type",type:"radio",onChange:"ui.awards.awardSortType = 'award'",checked:this.awardSortType==="award",name:"sort-awards"},{label:"Title",id:"sort_title",type:"radio",onChange:"ui.awards.awardSortType = 'title'",checked:this.awardSortType==="title",name:"sort-awards"},{label:"Reverse sort",id:"sort_reverse-sort",type:"checkbox",onChange:"ui.awards.awardSortTypeReverse = this.checked",checked:this.awardSortTypeReverse==-1,name:"sort-awards-reverse"}]});awardListContext=()=>({label:"Show by",elements:[...Object.getOwnPropertyNames(this.listTypes).reduce((e,t)=>{let s={label:`${this.listTypes[t]}`,id:`awards_list-type-${t}`,type:"radio",onChange:`ui.awards.listType = '${t}'`,checked:this.listType==t,name:"awards-list-type"};return e.push(s),e},[])]});get listType(){return r.ui?.mobile?.listType??"list"}set listType(e){r.ui.mobile.listType=e,r.writeConfiguration(),this.update()}get awardFilter(){let e=r.ui?.mobile?.awardsTypeFilter??"award";return this.awardTypesNames[e]}get awardFilterName(){return r.ui?.mobile?.awardsTypeFilter??"award"}set awardFilter(e){r.ui.mobile.awardsTypeFilter=e,r.writeConfiguration(),this.update()}get platformFilterName(){let e=r.ui?.mobile?.platformFilter??"platform";return e=="platform"?"platform":f[e]}get platformFilterCode(){return r.ui?.mobile?.platformFilter??"platform"}set platformFilterCode(e){r.ui.mobile.platformFilter=e,r.writeConfiguration(),this.update()}get awardSortType(){return r.ui?.mobile?.awardSortType??"date"}set awardSortType(e){r.ui.mobile.awardSortType=e,r.writeConfiguration(),this.update()}get awardSortTypeReverse(){return r.ui?.mobile?.awardSortTypeReverse??"1"}set awardSortTypeReverse(e){r.ui.mobile.awardSortTypeReverse=e?-1:1,r.writeConfiguration(),this.update()}applySort(){this.awardedGames=this.awardedGames.sort((e,t)=>this.awardSortTypeReverse*g[this.awardSortType](e,t))}applyFilter(){this.awardedGames=T.VisibleUserAwards,this.awardFilterName!=="award"&&(this.awardedGames=this.awardedGames.filter(e=>e.award==this.awardFilterName)),this.platformFilterCode!=="platform"&&(this.awardedGames=this.awardedGames.filter(e=>e.ConsoleID==this.platformFilterCode))}listTypes={list:"list",grid:"grid"};awardTypesNames={beaten:"Beaten",beaten_softcore:"Beaten Softcore",completed:"Completed",mastered:"Mastered",event:"Event",award:"Award Type"};sortMethods={latest:"date",title:"title"};awardedGames=[];constructor(){!r.ui.mobile.awards&&(r.ui.mobile.awards={}),ui.showLoader(),this.downloadAwardsData().then(()=>{this.getAwardsStats(),this.update()})}async update(){ui.showLoader(),await S(50),this.applyFilter(),this.applySort();let e=this.AwardsSection();ui.content.innerHTML="",ui.content.append(e),ui.removeLoader();let t=e.querySelector(".user-info__awards-list");b({list:t,items:this.awardedGames,callback:this.getGameElement})}getAwardsStats(){let e=T.VisibleUserAwards.reduce((t,s)=>(!t.platforms[s.ConsoleID]&&(t.platforms[s.ConsoleID]={count:0}),t.platforms[s.ConsoleID].name=s.ConsoleName,t.platforms[s.ConsoleID].count++,!t.awards[s.award]&&(t.awards[s.award]={count:0}),t.awards[s.award].name=this.awardTypesNames[s.award],t.awards[s.award].count++,t),{platforms:{},awards:{}});this.platformCodes=e.platforms,this.awardTypes=e.awards}async downloadAwardsData(){!T&&(T=await _.getUserAwards({}))}AwardsSection(){let e=document.createElement("section");return e.classList.add("awards__section","section"),e.innerHTML=`
      ${this.headerHtml()}
      <ul class="user-info__awards-list ${this.listType}">
      </ul>
    `,e}headerHtml(){return`
      <div class="section__header-container">
        <div class="section__header-title">Awards</div>
        <div class="section__control-container">
          <button class=" simple-button" onclick="generateContextMenu(ui.awards.awardSortContext(),event)">Sort</button>
          <button class=" simple-button" onclick="generateContextMenu(ui.awards.awardPlatformContext(),event)">${this.platformFilterName??"Platform"}</button>
          <button class=" simple-button" onclick="generateContextMenu(ui.awards.awardTypeContext(),event)">${this.awardFilter}</button>
          <button class="simple-button" onclick="generateContextMenu(ui.awards.awardListContext(),event)">${this.listType}</button>
        </div>
      </div>
    `}getGameElement(e){let t=document.createElement("li");return t.className=`awards__game-item ${e.award}`,t.dataset.id=e.AwardData,t.innerHTML=`    
      <div class="awards__game-container"  onclick="ui.showGameDetails(${e.AwardData}); event.stopPropagation()">
          <div class="awards__game-preview-container" onclick="ui.goto.game(${e.AwardData}); event.stopPropagation()">
              <img class="awards__game-preview" src="https://media.retroachievements.org${e.ImageIcon}" alt="">
          </div>
          <div class="awards__game-description" >
              <h2 class="awards__game-title">
                ${e.FixedTitle} ${w(e.badges)}
              </h2>
              <div  class="game-stats__button"  onclick="ui.expandGameItem(${e.AwardData},this); event.stopPropagation()">
                <i class="game-stats__icon game-stats__expand-icon"></i>
              </div>
              <div class="awards__game-stats__text">${e.ConsoleName}</div>

              <div class="awards__game-stats-container" >
                  <div class="awards__game-stats__text awards__game-award-type">${ui.awards.awardTypesNames[e.award]}</div>
                  <div class="awards__game-stats__text">${new Date(e.AwardedAt).toLocaleDateString()}</div>
                  
              </div>
          </div>
      </div>
  `,t}};var H={earned:n=>!!n.DateEarnedHardcore,notEarned:n=>!n.DateEarnedHardcore,missable:n=>n.type==="missable",progression:n=>n.type==="progression"||n.type==="win_condition",all:()=>!0};var E=class{filterContext=()=>({label:"Filter by",elements:[{label:"Progression",id:"filter_progression",type:"radio",onChange:"ui.game.filter = 'progression'",checked:this.filter==="progression",name:"filter-by-progression"},{label:"Missable",id:"filter_missable",type:"radio",onChange:"ui.game.filter = 'missable'",checked:this.filter==="missable",name:"filter-by-missable"},{label:"Earned",id:"filter_earned",type:"radio",onChange:"ui.game.filter = 'earned'",checked:this.filter==="earned",name:"filter-by-earned"},{label:"Disable",id:"filter_all",type:"radio",onChange:"ui.game.filter = 'all'",checked:this.filter==="all",name:"filter-by-all"},{label:"Reverse filter",id:"filter_reverse-filter",type:"checkbox",onChange:"ui.game.filterReverse = this.checked",checked:this.filterReverse==!0,name:"filter-cheevos-reverse"}]});sortContext=()=>({label:"Sort by",elements:[{label:"Earned date",id:"sort_latest",type:"radio",onChange:"ui.game.sortType = 'date'; ",checked:this.sortType==="date",name:"sort-cheevos"},{label:"Points",id:"sort_points-count",type:"radio",onChange:"ui.game.sortType = 'points'",checked:this.sortType==="points",name:"sort-cheevos"},{label:"Retropoits",id:"sort_retropoints-count",type:"radio",onChange:"ui.game.sortType = 'truepoints'",checked:this.sortType==="truepoints",name:"sort-cheevos"},{label:"Rarity",id:"sort_rarity-count",type:"radio",onChange:"ui.game.sortType = 'earnedCount'",checked:this.sortType==="earnedCount",name:"sort-cheevos"},{label:"Default",id:"sort_default-count",type:"radio",onChange:"ui.game.sortType = 'default'",checked:this.sortType==="default",name:"sort-cheevos"},{label:"Reverse sort",id:"sort_reverse-sort",type:"checkbox",onChange:"ui.game.sortTypeReverse = this.checked",checked:this.sortTypeReverse==-1,name:"sort-cheevos-reverse"}]});cheevosListContext=()=>({label:"Show by",elements:[...Object.getOwnPropertyNames(this.listTypes).reduce((e,t)=>{let s={label:`${this.listTypes[t]}`,id:`game_list-type-${t}`,type:"radio",onChange:`ui.game.listType = '${t}'`,checked:this.listType==t,name:"game-list-type"};return e.push(s),e},[])]});get sortType(){return r.ui?.mobile?.game?.sortType??"title"}set sortType(e){r.ui.mobile.game.sortType=e,r.writeConfiguration(),this.updateCheevos()}get filter(){return r.ui?.mobile?.game?.filter??"all"}set filter(e){r.ui.mobile.game.filter=e,r.writeConfiguration(),this.updateCheevos()}get sortTypeReverse(){return r.ui?.mobile?.game?.sortTypeReverse??1}set sortTypeReverse(e){r.ui.mobile.game.sortTypeReverse=e?-1:1,r.writeConfiguration(),this.updateCheevos()}get filterReverse(){return r.ui?.mobile?.game?.filterReverse??!1}set filterReverse(e){r.ui.mobile.game.filterReverse=e,r.writeConfiguration(),this.updateCheevos()}get listType(){return r.ui?.mobile?.game.listType??"grid"}set listType(e){r.ui.mobile.game.listType=e,r.writeConfiguration(),this.update()}listTypes={list:"list",grid:"grid"};constructor(e){!r.ui.mobile.game&&(r.ui.mobile.game={}),this.gameID=e,this.update()}updateCheevos(){this.achievements=Object.values(u[this.gameID].Achievements),this.achievements=this.achievements.filter(t=>this.filterReverse^H[this.filter](t)),this.achievements=this.achievements.sort((t,s)=>this.sortTypeReverse*g[this.sortType](t,s));let e=document.querySelector(".game-achivs__container");e.innerHTML=this.AchievementsListHtml()}getSectionElement(){let e=document.createElement("div");return e.classList.add("game__section","section"),e.innerHTML=`
      ${this.SectionHeaderHtml()}

      <ul class="game-achivs__container ${this.listType}">
       
      </ul>
    `,e}AchievementHtml(e){let t=~~(1e3*e.NumAwardedHardcore/this.gameData.NumDistinctPlayers)/10;return`
      <li class="achiv__achiv-container ${e.isHardcoreEarned?"hardcore":""}" onclick="ui.showAchivDetails(${e.ID}, ${this.gameID}); event.stopPropagation()">
        <div class="achiv__title-container">
            <div class="achiv__preview-container">
                <img class="user-info__achiv-preview ${e.isHardcoreEarned||ui.isSoftmode&&e.isEarned?"earned":""}"
                    src="https://media.retroachievements.org/Badge/${e.BadgeName}.png" alt="">
            </div>

            <div class="achiv__achiv-description">
                <h2 class="achiv__achiv-title">${e.Title}</h2>
                <p class="achiv__achiv-text">${e.Description}</p>
                <div class="achiv__icons">
              <div class="game-stats ">
                  <i class="game-stats__icon game-stats__points-icon"></i>
                  <div class="game-stats__text">${e.Points}</div>
              </div>
              <div class="game-stats game-stats__points">
                  <i class="game-stats__icon game-stats__retropoints-icon"></i>
                  <div class="game-stats__text">${e.TrueRatio}</div>
              </div>
              <div class="game-stats game-stats__points">
                  <i class="game-stats__icon game-stats__trending-icon"></i>
                  <div class="game-stats__text">${~~t}%</div>
              </div>
              <div class="game-stats game-stats__points">
                  <div class="game-stats__text achiv-rarity achiv-rarity__${e.difficulty}">${e.difficulty}</div>
              </div>
            </div>
            </div>
            
        </div>
        
      </li>
    
    `}AchievementsListHtml(){return`
      <div class="section__control-container">
        <button class=" simple-button" onclick="generateContextMenu(ui.game.sortContext(),event)">Sort</button>
        <button class="games-platform-filter simple-button" 
          onclick="generateContextMenu(ui.game.filterContext(),event)">
          ${this.platformFilter??"Filter"}
        </button>
        <button class="games-items-type simple-button" 
          onclick="generateContextMenu(ui.game.cheevosListContext(),event)">
          ${this.listType??"List"}
        </button>
      </div>
      ${this.achievements.reduce((e,t)=>(e+=this.AchievementHtml(t),e),"")}
    `}SectionHeaderHtml(){let e=ui.isSoftmode?{count:this.gameData.earnedStats.soft.count,points:this.gameData.earnedStats.soft.points,retropoints:this.gameData.earnedStats.hard.retropoints}:{count:this.gameData.earnedStats.hard.count,points:this.gameData.earnedStats.hard.points,retropoints:this.gameData.earnedStats.hard.retropoints},t=~~(100*e.count/this.gameData.NumAchievements);return`
      <div class="section__header-container game__header-container" onclick="ui.showGameDetails(${this.gameID});event.stopPropagation();">
            <!--<div class="game-header__background-container">
                <img class="game-header__background-img" src="https://media.retroachievements.org${this.gameData.ImageTitle}" alt="">
                <div class="game-header__background-gradient"></div>
                

            </div>-->
            <div class="game-header__main-info">
                <div class="game-header__icon-container">
                    <img class="game-header__icon" src="https://media.retroachievements.org${this.gameData.ImageIcon}" alt="">
                    <span class="game-header__retro-ratio  achiv-rarity__${this.gameData.gameDifficulty}">${this.gameData.retroRatio}
                    </span>
                    </div>
                <div class="game-header__description-container">
                    <h1 class="game-header__title">
                     ${this.gameData.FixedTitle} ${w(this.gameData.badges)}                       
                    </h1>
                      
                    <div class="game-header__platform">${this.gameData.ConsoleName}</div>
                    ${t>0?`
                      <div class="game-header__progress-container" style='--progress: ${t}%;'>
                          <div class="game-header__progress">Progress: ${t}% </div>
                      </div> 
                      `:""}  
                </div>
            </div>
            <div class="game-points__container">
                <div class="user-info__points-group">
                    <h3 class="game-points__points-name">cheevos</h3>
                    <p class="user-info__points">${e.count>0?e.count+"/":""}${this.gameData.NumAchievements}</p>
                </div>
                <div class="vertical-line"></div>

                <div class="user-info__points-group">
                    <h3 class="game-points__points-name">points</h3>
                    <p class="user-info__points">${e.count>0?e.points+"/":""}${this.gameData.points_total}</p>
                </div>
                <div class="vertical-line"></div>
                <div class="user-info__points-group">
                    <h3 class="game-points__points-name">retropoints</h3>
                    <p class="user-info__points">${e.count>0?e.retropoints+"/":""}${this.gameData.TotalRetropoints}</p>
                </div>
            </div>

      </div>
    `}update(e=this.gameID){if(ui.showLoader(),u[e]){this.gameData=u[this.gameID],this.achievements=Object.values(u[this.gameID].Achievements);let t=this.getSectionElement();ui.content.innerHTML="",ui.content.append(t),this.updateCheevos(),ui.removeLoader()}else _.getGameProgress({gameID:e}).then(t=>{u[e]=t}).then(()=>this.update())}};var M=["ID","Title","badges","ConsoleID","ImageIcon","NumAchievements","Points","retropoints","relisedAt","timeToBeat","timeToMaster","playersHardcore","timesBeaten","timesMastered","playersTotal","genres"];var O="./json/games/all_min.json",K=n=>n.map(t=>{let s={};if(t.forEach((a,i)=>{s={...s,[M[i]]:a}}),s.timeToBeat){let a=Math.round(s.timeToBeat/60),i=a>=60?`${~~(a/60)}hr${a>119?"s":""}`:"",o=a%60>0?`${a%60}mins`:"",d=`${i} ${o}`;s.timeToBeatString=d}return s.Date=s.relisedAt?new Date(s.relisedAt).toLocaleDateString():"",s.trueRatio=+(s.retropoints/s.Points).toFixed(1),s.beatenRate=Number((100*s.timesBeaten/s.playersHardcore).toFixed(1)),s.masteryRate=Number((100*s.timesMastered/s.playersHardcore).toFixed(1)),s.ImageIcon=`/Images/${s.ImageIcon}.png`,s.badges??=[],s}),N=async(n=O)=>{let t=await(await fetch(n)).json();return K(t)};var U=n=>`https://media.retroachievements.org${n}`;var L=class{gamesPlatformContext=()=>({label:"Filter by platform",elements:[{label:"All",id:"filter_all",type:"radio",onChange:"ui.library.platformFilter = 'all'",checked:this.platformFilterCode==="all",name:"filter-by-platform"},...Object.getOwnPropertyNames(f).reduce((e,t)=>{if(this.GAMES.some(s=>s.ConsoleID==t)){let s={label:`${f[t]}`,id:`filter_code-${t}`,type:"radio",onChange:`ui.library.platformFilter = ${t}`,checked:this.platformFilterCode==t,name:"filter-by-platform"};e.push(s)}return e},[])]});gamesSortContext=()=>({label:"Sort by",elements:[{label:"Title",id:"sort_title",type:"radio",onChange:"ui.library.sortType = 'title'; ",checked:this.sortType==="title",name:"sort-games"},{label:"Points",id:"sort_points-count",type:"radio",onChange:"ui.library.sortType = 'points'",checked:this.sortType==="points",name:"sort-games"},{label:"Achieves",id:"sort_achieves",type:"radio",onChange:"ui.library.sortType = 'achievementsCount'",checked:this.sortType==="achievementsCount",name:"sort-games"},{label:"Reverse sort",id:"sort_reverse-sort",type:"checkbox",onChange:"ui.library.sortTypeReverse = this.checked",checked:this.sortTypeReverse==-1,name:"sort-games-reverse"}]});get sortType(){return r.ui?.mobile?.library?.sortType??"title"}set sortType(e){r.ui.mobile.library.sortType=e,r.writeConfiguration(),this.updateGames()}get sortTypeReverse(){return r.ui?.mobile?.library?.sortTypeReverse??1}set sortTypeReverse(e){r.ui.mobile.library.sortTypeReverse=e?-1:1,r.writeConfiguration(),this.updateGames()}get platformFilter(){let e=r.ui?.mobile?.library?.platformFilter??"all";return e=="all"?"all":f[e]}get platformFilterCode(){return r.ui?.mobile?.library?.platformFilter??"all"}set platformFilter(e){r.ui.mobile.library.platformFilter=e,r.writeConfiguration(),this.updateGames(),document.querySelector(".games-platform-filter").innerText=`${this.platformFilter} (${this.games.length})`}titleFilter="";applyFilter(){if(this.games=this.platformFilterCode=="all"?this.GAMES:this.GAMES.filter(e=>e.ConsoleID==this.platformFilterCode),this.titleFilter){let e=new RegExp(this.titleFilter,"gi");this.games=this.games.filter(t=>t?.Title.match(e))}}applySort(){this.games=this.games.sort((e,t)=>this.sortTypeReverse*g[this.sortType](e,t))}constructor(){!r.ui.mobile.library&&(r.ui.mobile.library={}),this.update()}async update(){ui.showLoader(),await S(50),!this.GAMES&&await this.loadGamesArray(),this.applyFilter(),this.applySort();let e=this.LibrarySection();ui.content.innerHTML="",ui.content.append(e),ui.removeLoader(),b({list:this.gameList,items:this.games,callback:this.getGameElement})}updateGames(){this.applyFilter(),this.applySort(),this.gameList.innerHTML="",b({list:this.gameList,items:this.games,callback:this.getGameElement})}LibrarySection(){return this.librarySection=document.createElement("section"),this.librarySection.classList.add("library__section","section"),this.librarySection.appendChild(this.headerElement()),this.gameList=document.createElement("ul"),this.gameList.classList.add("games-list"),this.librarySection.appendChild(this.gameList),this.librarySection}headerElement(){let e=document.createElement("div");return e.classList.add("section__header-container"),e.innerHTML=`
        <div class="section__header-title">Library</div>
        <div class="section__control-container">
            <button class=" simple-button" onclick="generateContextMenu(ui.library.gamesSortContext(),event)">Sort</button>
            <button class="games-platform-filter simple-button" 
              onclick="generateContextMenu(ui.library.gamesPlatformContext(),event)">
              ${this.platformFilter??"Platform"} (${this.games.length})
            </button>
            <div class="hidden-text-input__container">
            <input class="hidden-text-input__input" type="search">
            <button class="hidden-text-input__button icon-button simple-button search-icon show-searchbar__button"
                onclick="ui.library.showHiddenInput(this)"></button>

        </div>
            </div>
    `,e}getGameElement(e){let t=document.createElement("li");return t.classList.add("awards__game-item"),t.dataset.id=e.id,t.innerHTML=`    
            <li class="awards__game-item" data-id="${e.id}">
                <div class="awards__game-container"  onclick="ui.showGameDetails(${e.id}); event.stopPropagation()">
                    <div class="awards__game-preview-container" onclick="ui.goto.game(${e.id}); event.stopPropagation()">
                        <img class="awards__game-preview" src="${U(e.ImageIcon)}" 
                          onerror="console.log('Image error: ', game.ImageIcon);" alt=""
                        >
                    </div>
                    <div class="awards__game-description" >
                        <h2 class="awards__game-title">${e.Title} ${w(e.badges)}</h2>
                        <div  class="game-stats__button"  onclick="ui.expandGameItem(${e.id},this); event.stopPropagation()">
                          <i class="game-stats__icon game-stats__expand-icon"></i>
                        </div>
                        <div class="awards__game-stats__text">${f[e.ConsoleID]}</div>

                        <div class="awards__game-stats-container" >                           
                        <div class="game-stats ">
                        <i class="game-stats__icon game-stats__achivs-icon"></i>
                        <div class="game-stats__text">${e.NumAchievements}</div>
                        </div>
                        <div class="game-stats game-stats__points">
                        <i class="game-stats__icon game-stats__points-icon"></i>
                        <div class="game-stats__text">${e.Points}</div>
                        </div>
                        </div>
                    </div>
                </div>
        `,t}async loadGamesArray(){this.GAMES={},await this.getAllGames()}async getAllGames(){try{this.GAMES=await N("../../json/games/all_min.json")}catch{return[]}}showHiddenInput(e){console.log("click");let t=e.closest(".hidden-text-input__container");t.classList.add("expanded-input");let s=t.querySelector("input");s.focus(),s.addEventListener("blur",a=>{s.value==""&&t.classList.remove("expanded-input")}),s.addEventListener("input",a=>{this.titleFilter=s.value,this.updateGames()})}};var k=class{constructor(){this.update()}async update(){ui.showLoader(),await delay(50),!this.FAVOURITES&&await this.loadGamesArray();let e=this.FavouritesSection();ui.content.innerHTML="",ui.content.append(e),ui.removeLoader(),b({list:this.gameList,items:this.FAVOURITES,callback:this.getGameElement})}async loadGamesArray(){this.FAVOURITES=Object.values(ui.favouritesGames)}FavouritesSection(){return this.librarySection=document.createElement("section"),this.librarySection.classList.add("favourites__section","section"),this.librarySection.appendChild(this.headerElement()),this.gameList=document.createElement("ul"),this.gameList.classList.add("games-list"),this.librarySection.appendChild(this.gameList),this.librarySection}headerElement(){let e=document.createElement("div");return e.classList.add("section__header-container"),e.innerHTML=`
        <div class="section__header-title">Favourites</div>
        <div class="section__control-container">
        <!--  <button class=" simple-button" onclick="generateContextMenu(ui.library.gamesSortContext(),event)">Sort</button>
            <button class="games-platform-filter simple-button" onclick="generateContextMenu(ui.library.gamesPlatformContext(),event)">${this.platformFilter??"Platform"}</button>
            <div class="hidden-text-input__container">
            <input class="hidden-text-input__input" type="search">
            <button class="hidden-text-input__button icon-button simple-button search-icon show-searchbar__button"
                onclick="ui.library.showHiddenInput(this)"></button> -->

        </div>
            </div>
    `,e}getGameElement(e){let t=document.createElement("li");t.classList.add("awards__game-item"),t.dataset.id=e?.ID;let s=e?.ImageIcon.slice(e?.ImageIcon.lastIndexOf("/")+1,e?.ImageIcon.lastIndexOf(".")+1)+"webp";return t.innerHTML=`    
            <li class="awards__game-item" data-id="${e?.ID}">
                <div class="awards__game-container"  onclick="ui.showGameDetails(${e?.ID}); event.stopPropagation()">
                    <div class="awards__game-preview-container" onclick="ui.goto.game(${e?.ID}); event.stopPropagation()">
                        <img class="awards__game-preview" src="../../assets/imgCache/${s}" alt="">
                    </div>
                    <div class="awards__game-description" >
                        <h2 class="awards__game-title">${e?.Title}</h2>
                        <div  class="game-stats__button"  onclick="ui.expandGameItem(${e?.ID},this); event.stopPropagation()">
                          <i class="game-stats__icon game-stats__expand-icon"></i>
                        </div>
                        <div class="awards__game-stats__text">${e?.ConsoleName}</div>

                        <div class="awards__game-stats-container" >                           
                        <div class="game-stats ">
                        <i class="game-stats__icon game-stats__achivs-icon"></i>
                        <div class="game-stats__text">${e?.NumAchievements}</div>
                        </div>
                        <div class="game-stats game-stats__points">
                        <i class="game-stats__icon game-stats__points-icon"></i>
                        <div class="game-stats__text">${e?.points_total}</div>
                        </div>
                        </div>
                    </div>
                </div>
        `,t}};var F=()=>fetch("./sections/login.elem").then(e=>e.text()).then(e=>{let t=document.createElement("section");return t.className="login__section",t.innerHTML=e,t}).then(e=>(r.USER_NAME&&(e.querySelector("#login_user-name").value=r.USER_NAME),r.API_KEY&&(e.querySelector("#login__api-key").value=r.API_KEY),r.identConfirmed&&e.querySelector("#login__submit-button").classList.add("verified"),e));var B=()=>{let n=document.createElement("div");return n.classList.add("loading_screen"),n.innerHTML='<div class="loading_screen__loader-icon"></div>',n};var u={},R=class{get favouritesGames(){return r.ui?.mobile?.favouritesGames??{}}get isSoftmode(){return r.ui?.mobile?.isSoftMode??!1}set isSoftmode(e){r.ui.mobile.isSoftMode=e,r.writeConfiguration()}switchGameMode(){this.isSoftmode=!this.isSoftmode,this.home=new C}routes={"/":async()=>{r.identConfirmed?(this.home=new C,this.clearNavbar(),this.navbar.home.classList.add("checked")):this.goto.login()},"/login":async()=>{this.showLoader();let e=await F();content.innerHTML="",content.append(e),this.clearNavbar(),this.navbar.login.classList.add("checked"),this.removeLoader()},"/home":async()=>{r.identConfirmed?(this.home=new C,this.clearNavbar(),this.navbar.home.classList.add("checked")):this.goto.login()},"/awards":async()=>{r.identConfirmed?(this.awards=new x,this.clearNavbar(),this.navbar.awards.classList.add("checked")):this.goto.login()},"/library":async()=>{r.identConfirmed?(this.library=new L,this.clearNavbar(),this.navbar.library.classList.add("checked")):this.goto.login()},"/favourites":async()=>{r.identConfirmed?(this.favourites=new k,this.clearNavbar(),this.navbar.favourites.classList.add("checked")):this.goto.login()},"/game":async e=>{if(r.identConfirmed){let t=e.gameID?parseInt(e.gameID,10):!1;t&&(this.game=new E(t))}else this.goto.login()},"/test":async()=>{content.innerHTML="",content.append(await J())}};goto={home:()=>{history.pushState(null,null,"#/home"),this.updatePage()},awards:()=>{history.pushState(null,null,"#/awards"),this.updatePage()},library:()=>{history.pushState(null,null,"#/library"),this.updatePage()},favourites:()=>{history.pushState(null,null,"#/favourites"),this.updatePage()},game:e=>{history.pushState(null,null,`#/game&gameID=${e}`),this.updatePage()},login:()=>{history.pushState(null,null,"#/login"),this.updatePage()}};constructor(){!r.ui?.mobile&&(r.ui.mobile={},r.writeConfiguration()),this.initializeElements(),this.addEvents()}initializeElements(){!r.ui.mobile&&(r.ui.mobile={}),this.sectionContainer=document.querySelector(".section-container"),this.app=document.getElementById("app"),this.content=document.getElementById("content"),this.navbar={container:document.querySelector(".navbar"),home:document.querySelector("#navbar_home"),awards:document.querySelector("#navbar_awards"),library:document.querySelector("#navbar_library"),favourites:document.querySelector("#navbar_favourites"),login:document.querySelector("#navbar_login")},r.identConfirmed&&this.navbar.login.classList.add("hidden")}addEvents(){window.addEventListener("hashchange",()=>{this.updatePage()}),window.addEventListener("DOMContentLoaded",()=>{window.dispatchEvent(new Event("hashchange"))}),app.addEventListener("click",()=>{this.removeContext(),this.removePopups()}),app.addEventListener("mousedown",()=>{this.removeContext()})}clearNavbar(){this.navbar.container.querySelectorAll(".checked").forEach(e=>e.classList.remove("checked"))}updatePage(){let e=window.location.hash.substring(1),[t,s]=e.split("&"),a=this.routes[t]||this.routes["/"],i=new URLSearchParams(s),o={};for(let[d,l]of i.entries())o[d]=l;a(o)}removePopups(){document.querySelectorAll(".popup").forEach(e=>e.remove())}removeContext(){document.querySelectorAll(".context").forEach(e=>{e.classList.add("hidden"),setTimeout(()=>e.remove(),1e3)})}async showGameDetails(e){this.removePopups(),this.showLoader();let t=document.createElement("div");t.addEventListener("touchend",i=>i.stopPropagation()),t.classList.add("popup-info__container","popup"),u[e]?(t.innerHTML=this.gamePopupHtml(u[e]),this.content.append(t),this.removeLoader()):_.getGameProgress({gameID:e}).then(i=>{u[e]=i,console.log(i),t.innerHTML=this.gamePopupHtml(i),this.content.append(t)}).then(()=>this.removeLoader());let s=u[e],a=this.gamePopupHtml(s);t.innerHTML=a,await S(500),document.querySelectorAll(".popup-info__image").forEach(i=>{i.addEventListener("click",o=>{o.stopPropagation();let d=document.createElement("div");d.classList.add("image-preview-popup"),d.innerHTML=`
          <img src="${i.src}" alt="">
        `,v.content.appendChild(d),d.addEventListener("click",l=>{l.stopPropagation(),d.remove()})})})}gamePopupHtml(e){return`
      <button class="close-popup" onclick="ui.removePopups()">X</button>
      <div class="popup-info__preview-container">
          <img src="https://media.retroachievements.org${e?.ImageIcon}" alt="icon" class="popup-info__preview">
          <span class="game-header__retro-ratio  achiv-rarity__${e?.gameDifficulty}">${e?.retroRatio}</span>
      </div>
      <h2 class="popup-info__title">${e?.Title}</h2>
      <div class="hor-line"></div>
      <ul class="popup-info__image-list">
          <li class="popup-info__image-container">
              <img src="https://media.retroachievements.org${e?.ImageBoxArt}" alt="" class="popup-info__image">
          </li>
          <li class="popup-info_image-container">
              <img src="https://media.retroachievements.org${e?.ImageTitle}" alt="" class="popup-info__image">
          </li>
          <li class="popup-info__image-container">
              <img src="https://media.retroachievements.org${e?.ImageIngame}" alt="" class="popup-info__image">
          </li>

      </ul>
      <div class="hor-line"></div>
      <div class="horizontal-buttons-container">
      <a class="round-button icon-button download-icon simple-button game-popup__download-button"
          href="https://google.com/search?q='${e?.FixedTitle}' '${f[e?.ConsoleID]}' ${Y}" target="_blank"></a>
      <a class="round-button icon-button redirect-icon simple-button game-popup__ra-button"
          href="https://retroachievements.org/game/${e?.ID}" target="_blank"></a>
      <button class="${v.favouritesGames[e?.ID]?"checked":""} round-button icon-button like-icon simple-button game-popup__like-button"
          onclick="addGameToFavourite(${e?.ID});this.classList.toggle('checked'); event.stopPropagation()"></button>
    </div>
    <div class="hor-line"></div>
      <div class="popup-info__properties">
          <div class="popup-info__property">Platform: <span>${e?.ConsoleName}</span></div>
          <div class="popup-info__property">Developer: <span>${e?.Developer} Soft</span></div>
          <div class="popup-info__property">Genre: <span>${e?.Genre}</span></div>
          <div class="popup-info__property">Publisher: <span>${e?.Publisher} Soft</span></div>
          <div class="popup-info__property">Released: <span>${e?.Released}</span></div>
          <div class="popup-info__property">Achievements total : <span>${e?.NumAchievements}</span></div>
          <div class="popup-info__property">Total points : <span>${e?.points_total}</span></div>
          <div class="popup-info__property">Total players : <span>${e?.players_total}</span></div>

      </div>
    `}async showAchivDetails(e,t){if(this.removePopups(),this.showLoader(),u[t]){let s=document.createElement("div");s.addEventListener("touchend",o=>o.stopPropagation()),s.classList.add("popup-info__container","popup");let a=u[t].Achievements[e],i=this.achivPopupHtml(a);s.innerHTML=i,this.content.append(s),this.removeLoader()}else{let s=await _.getGameProgress({gameID:t});u[t]=s,this.showAchivDetails(e,t)}}achivPopupHtml(e){return`
    <button class="close-popup" onclick="ui.removePopups()"></button>
    <div class="popup-info__preview-container">
        <img src="${e?.prevSrc}" alt="" class="popup-info__preview">
        <span class="game-header__retro-ratio  achiv-rarity__${e?.difficulty}">${e?.difficulty}</span>
    </div>
    <h2 class="popup-info__title">${e?.Title}</h2>
    <div class="hor-line"></div>
    <p class="popup-info__description">
    ${e?.Description}
    </p>
    <div class="hor-line"></div>
    <div class="popup-info__properties">
        <div class="popup-info__property">Points: <span>${e?.Points}</span></div>
        <div class="popup-info__property">Retropoints: <span>${e?.TrueRatio}</span></div>
        <div class="popup-info__property">Total players: <span>${e?.totalPlayers}</span></div>
        <div class="popup-info__property">Earned by: <span>${e?.NumAwarded}</span></div>
        <div class="popup-info__property">Earned harcore by: <span>${e?.NumAwardedHardcore}</span></div>
        ${e?.isEarned?`<div class="popup-info__property">Date earned : <span>${A(e?.DateEarned)}</span></div>`:""}
        ${e?.isHardcoreEarned?`<div class="popup-info__property">Date earned hardcore: <span>${A(e?.DateEarnedHardcore)}</span></div>`:""}
        <div class="popup-info__property">Date created : <span>${new Date(e?.DateCreated).toLocaleDateString()}</span></div>
        <div class="popup-info__property">Author : <span>${e?.Author}</span></div>
    </div>
  `}expandGameItem(e,t){let s=t.closest("li");s.classList.toggle("expanded");let a=i=>{this.showLoader();let o=document.createElement("div");o.classList.add("user-info__game-achivs-container");let d=document.createElement("ul");d.classList.add("user-info__game-achivs-list"),o.appendChild(d),s.appendChild(o),u[i]?(Object.values(u[i].Achievements).sort((l,p)=>g.date(l,p)).forEach(l=>{d.innerHTML+=this.achivHtml(l,i)}),this.removeLoader()):_.getGameProgress({gameID:i}).then(l=>{u[i]=l,Object.values(l.Achievements).sort((p,c)=>g.date(p,c)).forEach(p=>{d.innerHTML+=this.achivHtml(p,i)})}).then(()=>this.removeLoader())};s.querySelector(".user-info__game-achivs-container")??a(e)}achivHtmlList(e,t){return`    
            <li class="user-info__achiv-container"  onclick="ui.showAchivDetails(${e.ID},${t}); event.stopPropagation();">                
                <div class="user-info__achiv-preview-container">
                    <img class="user-info__achiv-preview ${(e.isHardcoreEarned||v.isSoftmode&&e.isEarned)&&"earned"}" src="${e.prevSrc}" alt="">
                </div>
                <div class="user-info__achiv-description">
                    <h2 class="user-info__game-title">${e.Title}</h2>
                    <div class="user-info_game-stats-container">
                        
                        <div class="game-stats ">
                        <i class="game-stats__icon game-stats__points-icon"></i>
                        <div class="game-stats__text">${e.Points}</div>
                        </div>
                        <div class="game-stats game-stats__points">
                        <i class="game-stats__icon game-stats__retropoints-icon"></i>
                        <div class="game-stats__text">${e.TrueRatio}</div>
                        </div>    
                        <div class="game-stats game-stats__points">
                        <i class="game-stats__icon game-stats__trending-icon"></i>
                        <div class="game-stats__text">${e.rateEarnedHardcore}</div>
                        </div>   
                        <div class="game-stats__difficult-container">
                          <div class="game-stats__text achiv-rarity achiv-rarity__${e.difficulty}"> </div>
                        </div>
                  
                    </div>
                </div>             
            </li>
        `}achivHtml(e,t){return`    
            <li class="user-info__achiv-container ${e.isHardcoreEarned?"hardcore":""}"  onclick="ui.showAchivDetails(${e.ID},${t}); event.stopPropagation();">                
                <div class="user-info__achiv-preview-container">
                    <img class="user-info__achiv-preview ${(e.isHardcoreEarned||v.isSoftmode&&e.isEarned)&&"earned"}" src="${e.prevSrc}" alt="">
                <div class="game-stats__text achiv-rarity achiv-rarity__${e.difficulty} achiv-rarity__circle"> </div>
                </div>
                <div class="user-info__achiv-description">
                    <h2 class="user-info__game-title">${e.Title}</h2>
                    <div class="user-info_game-stats-container">
                        
                        <div class="game-stats ">
                        <i class="game-stats__icon game-stats__points-icon"></i>
                        <div class="game-stats__text">${e.Points}</div>
                        </div>
                        <div class="game-stats game-stats__points">
                        <i class="game-stats__icon game-stats__retropoints-icon"></i>
                        <div class="game-stats__text">${e.TrueRatio}</div>
                        </div>    
                        <div class="game-stats game-stats__points">
                        <i class="game-stats__icon game-stats__trending-icon"></i>
                        <div class="game-stats__text">${e.rateEarnedHardcore}</div>
                        </div>   
                        <div class="game-stats__difficult-container">
                          <div class="game-stats__text achiv-rarity achiv-rarity__${e.difficulty}"> </div>
                        </div>
                  
                    </div>
                </div>             
            </li>
        `}showLoader(){this.removeLoader(),this.app.append(B())}removeLoader(){document.querySelectorAll(".loading_screen").forEach(e=>e.remove())}},J=()=>fetch("./sections/test.elem").then(e=>e.text()).then(e=>{let t=document.createElement("section");return t.className="test__section section",t.innerHTML=e,t});var Y="site:www.romhacking.net OR site:wowroms.com/en/roms OR site:cdromance.org OR site:coolrom.com.au/roms OR site:planetemu.net OR site:emulatorgames.net OR site:romsfun.com/roms OR site:emu-land.net/en";function W(n,e){e.stopPropagation(),ui.removeContext();let t=document.createElement("div");t.classList.add("context-menu__container","context"),t.addEventListener("touchend",i=>i.stopPropagation()),t.addEventListener("mousedown",i=>i.stopPropagation()),t.innerHTML+=`
    <div class="context__header" onclick="ui.removeContext()">${n.label}</div>
  `;let s=()=>{let i=document.createElement("div");return i.classList.add("context__controls"),n.elements.forEach(o=>{switch(o.type){case"radio":i.innerHTML+=`
            <div class="context__radio">
              <input type="radio" onchange="${o.onChange}"
                    name="${o.name}" ${o.checked&&"checked"} id="${o.id}">
              <label class="context__radio-label" for="${o.id}">${o.label}</label>
            </div>
          `;break;case"checkbox":i.innerHTML+=`
            <div class="context__checkbox">
              <input type="checkbox" onchange="${o.onChange}"
                    name="${o.name}" ${o.checked&&"checked"} id="${o.id}">
              <label class="context__checkbox-label" for="${o.id}">${o.label}</label>
            </div>
          `;break;default:return""}}),i},a=document.createElement("div");a.classList.add("context__control-container"),a.append(s(n)),t.append(a),ui.app.appendChild(t)}var r=new I,_=new D,v=new R;window.ui=v;window.generateContextMenu=W;window.submitRAData=()=>{let n=v.content.querySelector("#login_user-name").value,e=v.content.querySelector("#login__api-key").value;_.verifyUserIdent({userName:n,apiKey:e}).then(t=>{if(t.ID)X({userName:n,apiKey:e,userObj:t}),setTimeout(()=>{v.goto.home(),location.reload(!0)},1e3);else{r.identConfirmed=!1;let s=v.content.querySelector("#login__submit-button");s.classList.add("error"),s.classList.remove("verified")}})};function X({userName:n,apiKey:e,userObj:t}){r.USER_NAME=n,r.API_KEY=e,r.identConfirmed=!0,r.userImageSrc=`https://media.retroachievements.org${t?.UserPic}`;let s=v.content.querySelector("#login__submit-button");s.classList.remove("error"),s.classList.add("verified")}})();
