(()=>{var D=class{get _savedCompletionProgress(){return o._cfg?.apiWorker?.completionProgress??{}}get SAVED_COMPLETION_PROGRESS(){let e=this._savedCompletionProgress;return!e?.Total||o._cfg.apiWorker.targetUser!==o.targetUser?this.updateCompletionProgress({batchSize:500}).then(()=>this._savedCompletionProgress):this.updateCompletionProgress({batchSize:20,savedArray:e.Results}).then(()=>this._savedCompletionProgress)}set SAVED_COMPLETION_PROGRESS(e){e.Results=e.Results.map(t=>(delete t.ConsoleName,delete t.NumLeaderboards,t)),o._cfg.apiWorker||(o._cfg.apiWorker={}),o._cfg.apiWorker.targetUser=o.targetUser,o._cfg.apiWorker.completionProgress=e,o.writeConfiguration()}baseUrl="https://retroachievements.org/API/";endpoints={userProfile:"API_GetUserProfile.php",gameProgress:"API_GetGameInfoAndUserProgress.php",recentAchieves:"API_GetUserRecentAchievements.php",gameInfo:"API_GetGame.php",extendedGameInfo:"API_GetGameExtended.php",recentlyPlayedGames:"API_GetUserRecentlyPlayedGames.php",userAwards:"API_GetUserAwards.php",userGameRankAndScore:"API_GetUserGameRankAndScore.php",completionProgress:"API_GetUserCompletionProgress.php",gameList:"API_GetGameList.php",userSummary:"API_GetUserSummary.php"};getUrl({endpoint:e,targetUser:t,gameID:a,minutes:i,apiKey:s,userName:n,achievesCount:c,count:l,offset:p}){let d=new URL(e,this.baseUrl),h={y:s||o.API_KEY,z:n||o.USER_NAME,u:t||o.targetUser,g:a||o.gameID,m:i||2e3,i:a||o.gameID,f:1,h:1,a:c||5,c:l||20,o:p||0};return d.search=new URLSearchParams(h),d}constructor(){}getUserGameRank({targetUser:e,gameID:t}){let a=this.getUrl({endpoint:this.endpoints.userRankAndScore});return fetch(a).then(i=>i.json())}getProfileInfo({targetUser:e}){let t=this.getUrl({targetUser:e,endpoint:this.endpoints.userProfile});return fetch(t).then(a=>a.json())}getUserCompelitionProgress({targetUser:e,count:t,offset:a}){let i=this.getUrl({targetUser:e||o.targetUser,count:t||100,offset:a||0,endpoint:this.endpoints.completionProgress});return fetch(i).then(s=>s.json()).then(s=>(s.Results=s.Results.map(n=>(n.ID=n.GameID,n.NumAchievements=n.MaxPossible,delete n.MaxPossible,delete n.NumLeaderboards,n)),s))}getUserAwards({targetUser:e}){let t=this.getUrl({targetUser:e||o.targetUser,endpoint:this.endpoints.userAwards});return fetch(t).then(a=>a.json()).then(a=>(a.VisibleUserAwards=a.VisibleUserAwards.map(i=>(i.award=i.AwardType=="Game Beaten"?i.AwardDataExtra=="1"?"beaten":"beaten_softcore":i.AwardDataExtra=="1"?"mastered":"completed",i.DateEarned=i.AwardedAt,i.ConsoleName=="Events"&&(i.award="event"),i.timeString=this.toLocalTimeString(i.AwardedAt),i=this.fixGameTitle(i),i)),a))}getGameProgress({targetUser:e,gameID:t}){let a=this.getUrl({endpoint:this.endpoints.gameProgress,targetUser:e||o.targetUser,gameID:t||o.gameID});return fetch(a).then(i=>i.json()).then(i=>{i={...i,TotalRealPlayers:0,TotalRetropoints:0,points_total:0,progressionRetroRatio:0,beatenCount:1/0,masteredCount:1/0,earnedStats:{soft:{count:0,points:0,retropoints:0},hard:{count:0,points:0,retropoints:0}}};let s={Count:0,WinCount:0,WinAwardedCount:0,WinEarnedCount:0},n={isBeaten:!0,isBeatenSoftcore:!0,isWinEarned:!1,isWinEarnedSoftcore:!1};for(let l of Object.values(i.Achievements))i.TotalRetropoints+=l.TrueRatio,i.points_total+=l.Points,i.TotalRealPlayers<l.NumAwarded&&(i.TotalRealPlayers=l.NumAwarded),l.DateEarned&&(i.earnedStats.soft.count+=1,i.earnedStats.soft.points+=l.Points,i.earnedStats.soft.retropoints+=l.TrueRatio),l.DateEarnedHardcore&&(i.earnedStats.hard.count+=1,i.earnedStats.hard.points+=l.Points,i.earnedStats.hard.retropoints+=l.TrueRatio),l.type==="progression"&&(s.Count++,l.DateEarned?l.DateEarnedHardcore||(n.isBeaten=!1):(n.isBeaten=!1,n.isBeatenSoftcore=!1),i.beatenCount>l.NumAwardedHardcore&&(i.beatenCount=l.NumAwardedHardcore)),l.type==="win_condition"&&(l.DateEarnedHardcore?(n.isWinEarned=!0,n.isWinEarnedSoftcore=!0):l.DateEarned&&(n.isWinEarnedSoftcore=!0),s.WinCount++,l.NumAwardedHardcore>s.WinAwardedCount&&(s.WinAwardedCount=l.NumAwardedHardcore),l.DateEarnedHardcore&&s.WinEarnedCount++),l.NumAwardedHardcore<i.masteredCount&&(i.masteredCount=l.NumAwardedHardcore);i.achievements_published==i.NumAwardedToUserHardcore?i.award="mastered":n.isBeaten&&(n.isWinEarned||s.WinCount==0)&&(i.award="beaten"),i={...i,winVariantCount:s.WinCount,winEarnedCount:s.WinEarnedCount,progressionSteps:s.WinCount>0?s.Count+1:s.Count},s.WinCount>0&&(i.beatenCount=s.WinAwardedCount),i.beatenCount!=1/0&&(i.beatenRate=~~(1e4*i.beatenCount/i.TotalRealPlayers)/100),i.masteredCount!=1/0&&(i.masteryRate=~~(1e4*i.masteredCount/i.TotalRealPlayers)/100);let c=~~(i.TotalRetropoints/i.points_total*100)/100;return i.retroRatio=c,i.gameDifficulty=c>9?"insane":c>7?"expert":c>5?"pro":c>3?"standard":"easy",Object.values(i.Achievements).map(l=>this.fixAchievement(l,i)),i=this.fixGameTitle(i),i})}getRecentAchieves({targetUser:e,minutes:t}){let a=this.getUrl({endpoint:this.endpoints.recentAchieves,targetUser:e,minutes:t});return fetch(a).then(i=>i.json()).then(i=>i.map(s=>(s.Date=this.toLocalTimeString(s.Date),s)))}getGameInfo({gameID:e,extended:t}){let a=this.getUrl({endpoint:this.endpoints[t?"extendedGameInfo":"gameInfo"],gameID:e});return fetch(a).then(i=>i.json())}getRecentlyPlayedGames({targetUser:e,count:t}){let a=this.getUrl({endpoint:this.endpoints.recentlyPlayedGames,targetUser:e,count:t||50});return fetch(a).then(i=>i.json()).then(i=>i.map((s,n)=>(s.ID=s.GameID,s.Points=s.ScoreAchievedHardcore+"/"+s.PossibleScore,s.NumAchievements=s.NumAchievedHardcore+"/"+s.AchievementsTotal,s.NumLeaderboards="",s.DateEarnedHardcore=s.LastPlayed,this.fixGameTitle(s))))}getUserProfile({userName:e}){let t=this.getUrl({targetUser:e,userName:e,endpoint:this.endpoints.userProfile});return fetch(t).then(a=>a.json())}getUserSummary({targetUser:e,gamesCount:t=3,achievesCount:a}){let i=this.getUrl({targetUser:e,gameID:t,achievesCount:a,endpoint:this.endpoints.userSummary});return fetch(i).then(s=>s.json()).then(s=>(s.RecentlyPlayed=s.RecentlyPlayed.map(n=>(n.LastPlayed=this.toLocalTimeString(n.LastPlayed),s.Awarded[n.GameID]&&(n={...n,...s.Awarded[n.GameID]}),n=this.fixGameTitle(n),n)),s.RecentAchievements=Object.values(s.RecentAchievements).flatMap(n=>Object.values(n)).map(n=>(n.DateEarned=this.toLocalTimeString(n.DateAwarded),n)),s.isInGame=new Date-new Date(s.RecentlyPlayed[0].LastPlayed)<300*1e3,s))}verifyUserIdent({userName:e,apiKey:t}){let a=this.getUrl({targetUser:e,userName:e,apiKey:t,endpoint:this.endpoints.userProfile});return fetch(a).then(i=>i.json())}getGameList({userName:e,apiKey:t,systemID:a}){let i=this.getUrl({userName:e,apiKey:t,gameID:a,endpoint:this.endpoints.gameList});return fetch(i).then(s=>s.json())}doTestEndpoint({endpoint:e}){let t=this.getUrl({endpoint:e});return fetch(t).then(a=>a.json()).then(a=>console.log(a))}async updateCompletionProgress({savedArray:e=[],completionProgress:t=[],batchSize:a=500}){let i=await this.getUserCompelitionProgress({count:a,offset:t.length});t=[...t,...i.Results];let s=t.at(-1);if(e.findIndex(c=>c.hasOwnProperty("GameID")&&c.GameID===s.GameID&&c.MostRecentAwardedDate===s.MostRecentAwardedDate)>=0||t.length===i.Total){let c=t.map(l=>l.GameID);e=e.filter(l=>!c.includes(l.GameID)),e=[...t,...e],this.SAVED_COMPLETION_PROGRESS={Total:e.length,Results:e}}else setTimeout(()=>this.updateCompletionProgress({savedArray:e,completionProgress:t,batchSize:a}),100)}fixAchievement(e,t){let{BadgeName:a,DateEarned:i,DateEarnedHardcore:s,NumAwardedHardcore:n,NumAwarded:c,TrueRatio:l,ID:p}=e,{NumDistinctPlayers:d,NumAwardedToUserHardcore:h,TotalRealPlayers:b}=t,f=100*(n-h*.5)/((d+b)*.5-h*.5);t.Achievements[p]={...e,totalPlayers:d,isEarned:!!i,isHardcoreEarned:!!s,DateEarned:i&&this.toLocalTimeString(i),DateEarnedHardcore:s&&this.toLocalTimeString(s),prevSrc:`https://media.retroachievements.org/Badge/${a}.png`,rateEarned:~~(100*c/d)+"%",rateEarnedHardcore:~~(100*n/d)+"%",trend:f,difficulty:f<1.5&&l>300||l>=500?"hell":f<=3&&l>100||l>=300?"insane":f<8&&l>24?"expert":f<13&&l>10?"pro":f<20&&l>5||l>10?"standard":"easy"}}fixGameTitle(e){let t=[/\[SUBSET[^\[]*\]/gi,/~[^~]*~/g,".HACK//"],a=e.Title,i=t.reduce((s,n)=>{let c=new RegExp(n,"gi"),l=e.Title.match(c);return l&&l.forEach(p=>{a=a.replace(p,"");let d=p;s.push(d.replace(/[~\.\[\]]|subset -|\/\//gi,""))}),s},[]);return e.badges=i,e.FixedTitle=a.trim(),e}toLocalTimeString(e){!/(\+00\:00$)|(z$)/gi.test(e)&&(e+="+00:00");let a=new Date(e),i={day:"2-digit",month:"2-digit",year:"numeric",hour:"2-digit",minute:"2-digit",hour12:!1};return a}async rawgSearchGame({gameTitle:e,platformID:t}){e=e.split("|")[0];let a=Q[t];if(!a)return!1;let i="https://api.rawg.io/api/",s="games",n=new URL(s,i),c={search:e,platforms:a,key:"179353905bcb491d975b1fc03b3c8bd6"};n.search=new URLSearchParams(c);try{let l=await fetch(n);if(!l.ok)return console.log(`HTTP error! status: ${l.status}`),!1;let p=await l.json(),d=p.results?p.results[0]:null,h=e.replace(/[^a-z0-9]/gi," ").trim(),b=d?.name.replace(/[^a-z0-9]/gi," ").trim()??"";if(!d||h!==b)return console.log(`Game not found for title: ${e} on platform: ${t}`),!1;let f=["name","playtime","released","background_image","rating","ratings","added","metacritic","score","community_rating","genres"];return Object.fromEntries(Object.entries(d).filter(([X])=>f.includes(X)))}catch(l){return console.log(`Fetch error: ${l.message}`),!1}}},Q={1:167,2:83,3:79,4:26,5:24,6:43,7:49,8:null,9:119,10:117,11:74,12:27,13:46,14:null,15:77,17:112,18:9,21:15,23:null,24:null,25:23,27:12,28:null,29:null,33:null,37:null,38:41,39:107,40:106,41:17,43:111,44:null,45:null,46:null,47:null,49:null,51:28,53:null,56:null,57:null,63:null,69:null,71:null,72:null,73:null,74:null,75:null,76:null,77:null,78:13,80:null,101:null,102:null};var H="retroApiConfig",I=class{get version(){return this._cfg.version??"0"}set version(e){this._cfg.version=e,this.writeConfiguration()}get API_KEY(){return this._cfg.identification.RAApi_key}set API_KEY(e){this._cfg.identification.RAApi_key=e,this.writeConfiguration()}get USER_NAME(){return this._cfg.identification.RAApi_login}set USER_NAME(e){this._cfg.identification.RAApi_login=e,this.writeConfiguration()}get identConfirmed(){return this._cfg.identification.identConfirmed??!1}set identConfirmed(e){this._cfg.identification.identConfirmed=e,this.writeConfiguration()}get userImageSrc(){return this._cfg.identification.userImageSrc||""}set userImageSrc(e){this._cfg.identification.userImageSrc=e,this.ui.buttons&&(ui.buttons.userImage.src=e),this.writeConfiguration()}get targetUser(){return this._cfg.settings.targetUser||this.USER_NAME}set targetUser(e){this._cfg.settings.targetUser=e,this.writeConfiguration(),this.identConfirmed&&(ui.settings.getLastGameID(),ui.awards.updateAwards())}get gameID(){return this._cfg.settings.gameID}set gameID(e){this._cfg.settings.gameID=e,this.writeConfiguration()}get ui(){return this._cfg.ui}constructor(){this.readConfiguration()}readConfiguration(){let e=JSON.parse(localStorage.getItem(H));e||(e={identification:{RAApi_key:"",RAApi_login:""},settings:{updateDelay:15,sort:"default",gameID:1},ui:{}}),this._cfg=e,localStorage.setItem(H,JSON.stringify(this._cfg)),this.writeConfiguration()}delayedWrite;writeConfiguration(){clearTimeout(this.delayedWrite),this.delayedWrite=setTimeout(()=>{localStorage.setItem(H,JSON.stringify(this._cfg))},1e3)}};function y(r){return r?.reduce((e,t)=>e+=`<i class="game-badge game-badge__${t.toLowerCase()}">${t}</i>`,"")}var g={date:(r,e)=>{let t=r.DateEarned?new Date(r.DateEarnedHardcore?r.DateEarnedHardcore:r.DateEarned):-1/0;return(e.DateEarned?new Date(e.DateEarnedHardcore?e.DateEarnedHardcore:e.DateEarned):-1/0)-t},earnedCount:(r,e)=>e.NumAwardedHardcore-r.NumAwardedHardcore,points:(r,e)=>parseInt(r.Points)-parseInt(e.Points),truepoints:(r,e)=>r.TrueRatio-e.TrueRatio,default:(r,e)=>r.DisplayOrder===0?g.id(r,e):r.DisplayOrder-e.DisplayOrder,id:(r,e)=>r.ID-e.ID,disable:(r,e)=>0,achievementsCount:(r,e)=>parseInt(r.NumAchievements)-parseInt(e.NumAchievements),title:(r,e)=>{let t=r.Title?.toUpperCase()??r.FixedTitle.toUpperCase(),a=e.Title?.toUpperCase()??e.FixedTitle.toUpperCase();return t<a?-1:t>a?1:0},award:(r,e)=>{let t={event:6,mastered:5,"beaten-hardcore":4,completed:3,"beaten-softcore":2,started:1},a=t[e.award]??0,i=t[r.award]??0,s=new Date(e.AwardedAt),n=new Date(r.AwardedAt);return a-i!=0?a-i:s-n}};var N={points:`
        <svg style="bottom:-5px" fill="#a33fff" version="1.1" id="Capa_1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="14px" height="12px" viewBox="20 20 401.601 401.6" xml:space="preserve" stroke="#6b1be4">
            <g id="SVGRepo_bgCarrier" stroke-width="0"/>
            <g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"/>
            <g id="SVGRepo_iconCarrier"> <g> <g> <path d="M116.682,229.329c11.286,0,22.195-0.729,32.518-2.086V114.094c-10.322-1.356-21.232-2.085-32.518-2.085 c-64.441,0-116.681,23.693-116.681,52.921v11.477C0.001,205.634,52.241,229.329,116.682,229.329z"/> <path d="M116.682,288.411c11.286,0,22.195-0.729,32.518-2.084v-33.166c-10.325,1.356-21.229,2.095-32.518,2.095 c-56.25,0-103.199-18.054-114.227-42.082c-1.606,3.5-2.454,7.124-2.454,10.839v11.477 C0.001,264.718,52.241,288.411,116.682,288.411z"/> <path d="M149.199,314.823v-2.578c-10.325,1.356-21.229,2.095-32.518,2.095c-56.25,0-103.199-18.054-114.227-42.082 C0.848,275.757,0,279.381,0,283.096v11.477c0,29.229,52.24,52.922,116.681,52.922c12.887,0,25.282-0.95,36.873-2.7 c-2.873-5.877-4.355-12.075-4.355-18.496V314.823z"/> <path d="M284.92,22.379c-64.441,0-116.681,23.693-116.681,52.921v11.477c0,29.228,52.24,52.921,116.681,52.921 c64.44,0,116.681-23.693,116.681-52.921V75.3C401.601,46.072,349.36,22.379,284.92,22.379z"/> <path d="M284.92,165.626c-56.25,0-103.199-18.053-114.227-42.082c-1.606,3.499-2.454,7.123-2.454,10.839v11.477 c0,29.228,52.24,52.921,116.681,52.921c64.44,0,116.681-23.693,116.681-52.921v-11.477c0-3.716-0.848-7.34-2.454-10.839 C388.119,147.573,341.17,165.626,284.92,165.626z"/> <path d="M284.92,224.71c-56.25,0-103.199-18.054-114.227-42.082c-1.606,3.499-2.454,7.123-2.454,10.839v11.477 c0,29.229,52.24,52.922,116.681,52.922c64.44,0,116.681-23.693,116.681-52.922v-11.477c0-3.716-0.848-7.34-2.454-10.839 C388.119,206.657,341.17,224.71,284.92,224.71z"/> <path d="M284.92,286.983c-56.25,0-103.199-18.054-114.227-42.082c-1.606,3.5-2.454,7.123-2.454,10.838v11.478 c0,29.228,52.24,52.921,116.681,52.921c64.44,0,116.681-23.693,116.681-52.921v-11.478c0-3.715-0.848-7.34-2.454-10.838 C388.119,268.928,341.17,286.983,284.92,286.983z"/> <path d="M284.92,346.066c-56.25,0-103.199-18.053-114.227-42.081c-1.606,3.5-2.454,7.125-2.454,10.838V326.3 c0,29.228,52.24,52.921,116.681,52.921c64.44,0,116.681-23.693,116.681-52.921v-11.478c0-3.715-0.848-7.34-2.454-10.838 C388.119,328.012,341.17,346.066,284.92,346.066z"/> </g> </g> </g>

        </svg>`};function A(r){return new Date(r).toLocaleString()}var w=r=>{/\/>/g.test(r)&&(r=r.replace(/<(\w+)([^>]*)\/>/g,(t,a,i)=>new Set(["area","base","br","col","embed","hr","img","input","link","meta","param","source","track","wbr"]).has(a.toLowerCase())?t:`<${a}${i}></${a}>`));let e=document.createElement("template");return e.innerHTML=r.trim(),e.content.firstElementChild};function U(r){let e=+(r.retropoints/r.hardpoints).toFixed(2);return`
        <div class="section__header-container user-info__header-container">
            <div class="user-info__header">
                <div class="user-info__avatar-container">
                    <img class="user-info__avatar" src="${r.userImageSrc}" onclick="ui.goto.login()">
                    ${e?`<span class="game-header__retro-ratio  achiv-rarity__standard">${e}</span>`:""}
                </div>
                <button class="button__switch-mode ${m.isSoftmode?"softmode":""}" onclick="ui.switchGameMode()">${m.isSoftmode?"SOFT":"HARD"}</button>
                <div class="user-info__user-name-container">
                    <h1 class="user-info__user-name">${r.userName}</h1>
                    <div class="user-info__user-rank">${r.userRank}</div>
                    <div class="user-info__rich-presence">Member since: ${new Date(r.memberSince).toLocaleDateString()}</div>
                </div>
            </div>
            ${r.isInGame?`
            <div class="user-info__rich-presence"> ${r.richPresence}</div>
            `:""}
            
            
        </div>
    `}var F=({BadgeName:r})=>`https://media.retroachievements.org/Badge/${r}.png`,E=r=>`https://media.retroachievements.org${r}`;function Z(r){let{Title:e,Description:t,ID:a,GameID:i,HardcoreAchieved:s,IsAwarded:n,DateEarned:c,BadgeName:l,Points:p}=r;return`
        <li class="user-info__cheevo-container">
            <div class="user-info__cheevo-title-container" 
                onclick="ui.showAchivDetails(${a}, ${i}); event.stopPropagation()">
                <div class="user-info__cheevo-preview-container">
                    <img class="user-info__cheevo-preview ${s||m.isSoftmode&&n?"earned":""}"
                        src="${F({BadgeName:l})}">
                </div>
                <div class="user-info__cheevo-descriptions">
                    <h2 class="user-info__cheevo-title">${e}</h2>
                    <p class="user-info__cheevo-description">${t}</p>
                    <div class="user-info__cheevo-stats-container">
                        <p class="user-info__cheevo-stats-text points">
                        ${N.points} ${p} Points</p>
                        <p class="game-stats__text cheevo-stats__unlocked">${j(c)}</p>
                    </div>
                </div>
            </div>
        </li>`}function B({lastAchievements:r}){return r.reduce((e,t)=>{let a=Z(t);return e+=a,e},"")}var j=r=>{let e=new Date(r),t=e.getTime(),a=Date.now(),i=Math.round((a-e)/6e4);if(i<2)return"just now";if(i<60)return i+" minutes ago";let s=Math.round(i/60);return s<24?s+" hours ago":e.toLocaleString()};function ee(r){let{GameID:e,ImageIcon:t,FixedTitle:a,badges:i,LastPlayed:s,ConsoleName:n,NumAchieved:c,NumAchievedHardcore:l,NumPossibleAchievements:p,ScoreAchieved:d,ScoreAchievedHardcore:h,PossibleScore:b}=r;return`    
        <li class="user-info__last-game-container" data-id="${e}">
            <div class="user-info__game-main-info"  onclick="ui.showGameDetails(${e}); event.stopPropagation()">
                <div class="user-info__game-preview-container" onclick="ui.goto.game(${e}); event.stopPropagation()">
                    <img class="user-info__game-preview" src="${E(t)}" alt="">
                </div>
                <div class="user-info__game-description" >
                    <h2 class="user-info__game-title">${a} ${y(i)}</h2>
                    <div class="game-stats__text">${A(s)} | ${n}</div>
                    <div  class="game-stats__button"  onclick="ui.expandGameItem(${e},this); event.stopPropagation()">
                        <i class="game-stats__icon game-stats__expand-icon"></i>
                    </div>
                    <div class="user-info_game-stats-container">
                        <div class="game-stats ">
                            <i class="game-stats__icon game-stats__achivs-icon"></i>
                            <div class="game-stats__text">${ui.isSoftmode?c:l} / ${p}</div>
                            </div>
                            <div class="game-stats game-stats__points">
                            <i class="game-stats__icon game-stats__points-icon"></i>
                            <div class="game-stats__text">${ui.isSoftmode?d:h} / ${b}</div>
                        </div>
                    </div>
                </div>
            </div>
        </li>
        `}function W({lastGames:r}){return r.reduce((e,t)=>{let a=ee(t);return e+=a,e},"")}var x,S=class{constructor(){this.update()}async update(){if(ui.showLoader(),x){let e=this.HomeSection();ui.content.innerHTML="",ui.content.append(e),ui.removeLoader()}else await this.loadUserInfo(),this.update()}async loadUserInfo(){let e=await _.getUserSummary({gamesCount:5,achievesCount:8});x={userName:e.User,status:e.Status?.toLowerCase(),richPresence:e.RichPresenceMsg,memberSince:e.MemberSince,userImageSrc:`https://media.retroachievements.org${e.UserPic}`,userRank:e.Rank?`Rank: ${e.Rank} (Top ${~~(1e4*e.Rank/e.TotalRanked)/100}%)`:"Rank is unavailable",softpoints:e.TotalSoftcorePoints,retropoints:e.TotalTruePoints,hardpoints:e.TotalPoints,lastGames:e.RecentlyPlayed,lastAchievements:Object.values(e.RecentAchievements).map(t=>(t.DateEarnedHardcore=t.DateAwarded,t)).sort((t,a)=>g.date(t,a)),isInGame:e.isInGame}}HomeSection(){return w(`
            <section class="home__section section">
                ${U(x)}
                <div class="user-info__container">
                    <ul class="user-info__last-games-list">
                        <button  class="user-info__block-header">
                            <h2>Last Unlocks</h2>
                            <p style="display:none">See more</p>
                        </button>
                        ${B(x)}
                        <button  class="user-info__block-header">
                            <h2>Recently Played</h2>
                            <p style="display:none">See more</p>
                        </button>
                        ${W(x)}
                    </ul>
                </div>
            </section
        `)}};var T=r=>new Promise(e=>setTimeout(e,r));function C({list:r,items:e,callback:t}){let a=document.createElement("div");a.classList.add("lazy-load_trigger"),r.appendChild(a);let i=0,s=40,n=d=>{for(let h=0;h<d&&i<e.length;h++)r.appendChild(t(e[i++]))};n(s);let c=(d,h)=>{d.forEach(b=>{b.isIntersecting&&(n(s),h.unobserve(a),i<e.length?(r.appendChild(a),h.observe(a)):a.remove())})},l={root:null,rootMargin:"0px",threshold:1};new IntersectionObserver(c,l).observe(a)}var v={1:"Genesis/Mega Drive",2:"Nintendo 64",3:"SNES/Super Famicom",4:"Game Boy",5:"Game Boy Advance",6:"Game Boy Color",7:"NES/Famicom",8:"PC Engine/TurboGrafx-16",9:"Sega CD",10:"32X",11:"Master System",12:"PlayStation",13:"Atari Lynx",14:"Neo Geo Pocket",15:"Game Gear",17:"Atari Jaguar",18:"Nintendo DS",19:"Nintendo Wii",21:"PlayStation 2",23:"Magnavox Odyssey 2",24:"Pokemon Mini",25:"Atari 2600",27:"Arcade",28:"Virtual Boy",29:"MSX",33:"SG-1000",37:"Amstrad CPC",38:"Apple II",39:"Saturn",40:"Dreamcast",41:"PlayStation Portable",43:"3DO Interactive Multiplayer",44:"ColecoVision",45:"Intellivision",46:"Vectrex",47:"PC-8000/8800",49:"PC-FX",51:"Atari 7800",53:"WonderSwan",56:"Neo Geo CD",57:"Fairchild Channel F",63:"Watara Supervision",69:"Mega Duck",71:"Arduboy",72:"WASM-4",73:"Arcadia 2001",74:"Interton VC 4000",75:"Elektor TV Games Computer",76:"PC Engine CD/TurboGrafx-CD",77:"Atari Jaguar CD",78:"Nintendo DSi",80:"Uzebox",101:"Events",102:"Standalone"};var $,L=class{awardTypeContext=()=>({label:"Filter by type",elements:[{label:`All (${$.VisibleUserAwards.length})`,id:"filter_all",type:"radio",onChange:"ui.awards.awardFilter = 'award'",checked:this.awardFilterName==="award",name:"filter-by-award"},...Object.getOwnPropertyNames(this.awardTypes).reduce((e,t)=>{let a={label:`${this.awardTypes[t].name} (${this.awardTypes[t].count})`,id:`filter_code-${t}`,type:"radio",onChange:`ui.awards.awardFilter = '${t}'`,checked:this.awardFilterName==t,name:"filter-by-award"};return e.push(a),e},[])]});awardPlatformContext=()=>({label:"Filter by platform",elements:[{label:`All (${$.VisibleUserAwards.length})`,id:"filter_all",type:"radio",onChange:"ui.awards.platformFilterCode = 'platform'",checked:this.platformFilterName==="platform",name:"filter-by-platform"},...Object.getOwnPropertyNames(this.platformCodes).reduce((e,t)=>{let a={label:`${this.platformCodes[t].name} (${this.platformCodes[t].count})`,id:`filter_code-${t}`,type:"radio",onChange:`ui.awards.platformFilterCode = ${t}`,checked:this.platformFilterCode==t,name:"filter-by-platform"};return e.push(a),e},[])]});awardSortContext=()=>({label:"Sort by",elements:[{label:"Date earned",id:"sort_date-earned",type:"radio",onChange:"ui.awards.awardSortType = 'date'",checked:this.awardSortType==="date",name:"sort-awards"},{label:"Type",id:"sort_award-type",type:"radio",onChange:"ui.awards.awardSortType = 'award'",checked:this.awardSortType==="award",name:"sort-awards"},{label:"Title",id:"sort_title",type:"radio",onChange:"ui.awards.awardSortType = 'title'",checked:this.awardSortType==="title",name:"sort-awards"},{label:"Reverse sort",id:"sort_reverse-sort",type:"checkbox",onChange:"ui.awards.awardSortTypeReverse = this.checked",checked:this.awardSortTypeReverse==-1,name:"sort-awards-reverse"}]});awardListContext=()=>({label:"Show by",elements:[...Object.getOwnPropertyNames(this.listTypes).reduce((e,t)=>{let a={label:`${this.listTypes[t]}`,id:`awards_list-type-${t}`,type:"radio",onChange:`ui.awards.listType = '${t}'`,checked:this.listType==t,name:"awards-list-type"};return e.push(a),e},[])]});get listType(){return o.ui?.mobile?.listType??"list"}set listType(e){o.ui.mobile.listType=e,o.writeConfiguration(),this.update()}get awardFilter(){let e=o.ui?.mobile?.awardsTypeFilter??"award";return this.awardTypesNames[e]}get awardFilterName(){return o.ui?.mobile?.awardsTypeFilter??"award"}set awardFilter(e){o.ui.mobile.awardsTypeFilter=e,o.writeConfiguration(),this.update()}get platformFilterName(){let e=o.ui?.mobile?.platformFilter??"platform";return e=="platform"?"platform":v[e]}get platformFilterCode(){return o.ui?.mobile?.platformFilter??"platform"}set platformFilterCode(e){o.ui.mobile.platformFilter=e,o.writeConfiguration(),this.update()}get awardSortType(){return o.ui?.mobile?.awardSortType??"date"}set awardSortType(e){o.ui.mobile.awardSortType=e,o.writeConfiguration(),this.update()}get awardSortTypeReverse(){return o.ui?.mobile?.awardSortTypeReverse??"1"}set awardSortTypeReverse(e){o.ui.mobile.awardSortTypeReverse=e?-1:1,o.writeConfiguration(),this.update()}applySort(){this.awardedGames=this.awardedGames.sort((e,t)=>this.awardSortTypeReverse*g[this.awardSortType](e,t))}applyFilter(){this.awardedGames=$.VisibleUserAwards,this.awardFilterName!=="award"&&(this.awardedGames=this.awardedGames.filter(e=>e.award==this.awardFilterName)),this.platformFilterCode!=="platform"&&(this.awardedGames=this.awardedGames.filter(e=>e.ConsoleID==this.platformFilterCode))}listTypes={list:"list",grid:"grid"};awardTypesNames={beaten:"Beaten",beaten_softcore:"Beaten Softcore",completed:"Completed",mastered:"Mastered",event:"Event",award:"Award Type"};sortMethods={latest:"date",title:"title"};awardedGames=[];constructor(){!o.ui.mobile.awards&&(o.ui.mobile.awards={}),ui.showLoader(),this.downloadAwardsData().then(()=>{this.getAwardsStats(),this.update()})}async update(){ui.showLoader(),await T(50),this.applyFilter(),this.applySort();let e=this.AwardsSection();ui.content.innerHTML="",ui.content.append(e),ui.removeLoader();let t=e.querySelector(".user-info__awards-list");C({list:t,items:this.awardedGames,callback:this.getGameElement})}getAwardsStats(){let e=$.VisibleUserAwards.reduce((t,a)=>(!t.platforms[a.ConsoleID]&&(t.platforms[a.ConsoleID]={count:0}),t.platforms[a.ConsoleID].name=a.ConsoleName,t.platforms[a.ConsoleID].count++,!t.awards[a.award]&&(t.awards[a.award]={count:0}),t.awards[a.award].name=this.awardTypesNames[a.award],t.awards[a.award].count++,t),{platforms:{},awards:{}});this.platformCodes=e.platforms,this.awardTypes=e.awards}async downloadAwardsData(){!$&&($=await _.getUserAwards({}))}AwardsSection(){let e=document.createElement("section");return e.classList.add("awards__section","section"),e.innerHTML=`
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
                ${e.FixedTitle} ${y(e.badges)}
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
  `,t}};var q={earned:r=>!!r.DateEarnedHardcore,notEarned:r=>!r.DateEarnedHardcore,missable:r=>r.type==="missable",progression:r=>r.type==="progression"||r.type==="win_condition",all:()=>!0};var k=class{filterContext=()=>({label:"Filter by",elements:[{label:"Progression",id:"filter_progression",type:"radio",onChange:"ui.game.filter = 'progression'",checked:this.filter==="progression",name:"filter-by-progression"},{label:"Missable",id:"filter_missable",type:"radio",onChange:"ui.game.filter = 'missable'",checked:this.filter==="missable",name:"filter-by-missable"},{label:"Earned",id:"filter_earned",type:"radio",onChange:"ui.game.filter = 'earned'",checked:this.filter==="earned",name:"filter-by-earned"},{label:"Disable",id:"filter_all",type:"radio",onChange:"ui.game.filter = 'all'",checked:this.filter==="all",name:"filter-by-all"},{label:"Reverse filter",id:"filter_reverse-filter",type:"checkbox",onChange:"ui.game.filterReverse = this.checked",checked:this.filterReverse==!0,name:"filter-cheevos-reverse"}]});sortContext=()=>({label:"Sort by",elements:[{label:"Earned date",id:"sort_latest",type:"radio",onChange:"ui.game.sortType = 'date'; ",checked:this.sortType==="date",name:"sort-cheevos"},{label:"Points",id:"sort_points-count",type:"radio",onChange:"ui.game.sortType = 'points'",checked:this.sortType==="points",name:"sort-cheevos"},{label:"Retropoits",id:"sort_retropoints-count",type:"radio",onChange:"ui.game.sortType = 'truepoints'",checked:this.sortType==="truepoints",name:"sort-cheevos"},{label:"Rarity",id:"sort_rarity-count",type:"radio",onChange:"ui.game.sortType = 'earnedCount'",checked:this.sortType==="earnedCount",name:"sort-cheevos"},{label:"Default",id:"sort_default-count",type:"radio",onChange:"ui.game.sortType = 'default'",checked:this.sortType==="default",name:"sort-cheevos"},{label:"Reverse sort",id:"sort_reverse-sort",type:"checkbox",onChange:"ui.game.sortTypeReverse = this.checked",checked:this.sortTypeReverse==-1,name:"sort-cheevos-reverse"}]});cheevosListContext=()=>({label:"Show by",elements:[...Object.getOwnPropertyNames(this.listTypes).reduce((e,t)=>{let a={label:`${this.listTypes[t]}`,id:`game_list-type-${t}`,type:"radio",onChange:`ui.game.listType = '${t}'`,checked:this.listType==t,name:"game-list-type"};return e.push(a),e},[])]});get sortType(){return o.ui?.mobile?.game?.sortType??"title"}set sortType(e){o.ui.mobile.game.sortType=e,o.writeConfiguration(),this.updateCheevos()}get filter(){return o.ui?.mobile?.game?.filter??"all"}set filter(e){o.ui.mobile.game.filter=e,o.writeConfiguration(),this.updateCheevos()}get sortTypeReverse(){return o.ui?.mobile?.game?.sortTypeReverse??1}set sortTypeReverse(e){o.ui.mobile.game.sortTypeReverse=e?-1:1,o.writeConfiguration(),this.updateCheevos()}get filterReverse(){return o.ui?.mobile?.game?.filterReverse??!1}set filterReverse(e){o.ui.mobile.game.filterReverse=e,o.writeConfiguration(),this.updateCheevos()}get listType(){return o.ui?.mobile?.game.listType??"grid"}set listType(e){o.ui.mobile.game.listType=e,o.writeConfiguration(),this.update()}listTypes={list:"list",grid:"grid"};constructor(e){!o.ui.mobile.game&&(o.ui.mobile.game={}),this.gameID=e,this.update()}updateCheevos(){this.achievements=Object.values(u[this.gameID].Achievements),this.achievements=this.achievements.filter(t=>this.filterReverse^q[this.filter](t)),this.achievements=this.achievements.sort((t,a)=>this.sortTypeReverse*g[this.sortType](t,a));let e=document.querySelector(".game-achivs__container");e.innerHTML=this.AchievementsListHtml()}getSectionElement(){let e=document.createElement("div");return e.classList.add("game__section","section"),e.innerHTML=`
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
                     ${this.gameData.FixedTitle} ${y(this.gameData.badges)}                       
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
    `}update(e=this.gameID){if(ui.showLoader(),u[e]){this.gameData=u[this.gameID],this.achievements=Object.values(u[this.gameID].Achievements);let t=this.getSectionElement();ui.content.innerHTML="",ui.content.append(t),this.updateCheevos(),ui.removeLoader()}else _.getGameProgress({gameID:e}).then(t=>{u[e]=t}).then(()=>this.update())}};var V=["ID","Title","badges","ConsoleID","ImageIcon","NumAchievements","Points","retropoints","relisedAt","timeToBeat","timeToMaster","playersHardcore","timesBeaten","timesMastered","playersTotal","genres","series"];var te="./json/games/all_min.json",ae=r=>r.map(t=>{let a={};if(t.forEach((i,s)=>{a={...a,[V[s]]:i}}),a.timeToBeat){let i=Math.round(a.timeToBeat/60),s=i>=60?`${~~(i/60)}hr${i>119?"s":""}`:"",n=i%60>0?`${i%60}mins`:"",c=`${s} ${n}`;a.timeToBeatString=c}return a.Date=a.relisedAt?new Date(a.relisedAt).toLocaleDateString():"",a.trueRatio=+(a.retropoints/a.Points).toFixed(1),a.beatenRate=Number((100*a.timesBeaten/a.playersHardcore).toFixed(1)),a.masteryRate=Number((100*a.timesMastered/a.playersHardcore).toFixed(1)),a.ImageIcon=`/Images/${a.ImageIcon}.png`,a.badges??=[],a}),z=async(r=te)=>{let t=await(await fetch(r)).json();return ae(t)};function O(r){return w(`
        <div class="section__header-container">
            <div class="section__header-title">Library</div>
            <div class="section__control-container">
                <button class=" simple-button" onclick="generateContextMenu(ui.library.gamesSortContext(),event)">Sort</button>
                <button class="games-platform-filter simple-button" onclick="generateContextMenu(ui.library.gamesPlatformContext(),event)">${r.platformFilter??"Platform"} (${r.games.length})
                </button>
                <div class="hidden-text-input__container">
                    <input class="hidden-text-input__input" type="search">
                    <button class="hidden-text-input__button icon-button simple-button search-icon show-searchbar__button"
                    onclick="ui.library.showHiddenInput(this)"></button>
                </div>
            </div>
        </div>
    `)}function M(r){let{ID:e,ImageIcon:t,Title:a,badges:i,NumAchievements:s,Points:n,ConsoleID:c}=r,l=w(`
        <li class="library__game-item">
            <div class="library__game-container"  onclick="ui.showGameDetails(${e}); event.stopPropagation()">
                <div class="awards__game-preview-container" onclick="ui.goto.game(${e}); event.stopPropagation()">
                    <img class="awards__game-preview" src="${E(t)}">
                </div>
                <div class="awards__game-description">
                    <h2 class="library__game-title">${a} ${y(i)}</h2>
                    <div  class="game-stats__button"  onclick="ui.expandGameItem(${e},this); event.stopPropagation()">
                        <i class="game-stats__icon game-stats__expand-icon"/>
                    </div>
                    <div class="awards__game-stats__text">${v[c]}</div>

                    <div class="awards__game-stats-container" >
                        <div class="game-stats ">
                            <i class="game-stats__icon game-stats__achivs-icon"/>
                            <div class="game-stats__text">${s}</div>
                        </div>
                        <div class="game-stats game-stats__points">
                            <i class="game-stats__icon game-stats__points-icon"/>
                            <div class="game-stats__text">${n}</div>
                        </div>
                    </div>
                </div>
            </div>
        </li>
    `);return l.dataset.id=e,l}var R=class{gamesPlatformContext=()=>({label:"Filter by platform",elements:[{label:"All",id:"filter_all",type:"radio",onChange:"ui.library.platformFilter = 'all'",checked:this.platformFilterCode==="all",name:"filter-by-platform"},...Object.keys(v).reduce((e,t)=>{if(this.GAMES.some(a=>a.ConsoleID==t)){let a={label:`${v[t]}`,id:`filter_code-${t}`,type:"radio",onChange:`ui.library.platformFilter = ${t}`,checked:this.platformFilterCode==t,name:"filter-by-platform"};e.push(a)}return e},[])]});gamesSortContext=()=>({label:"Sort by",elements:[{label:"Title",id:"sort_title",type:"radio",onChange:"ui.library.sortType = 'title'; ",checked:this.sortType==="title",name:"sort-games"},{label:"Points",id:"sort_points-count",type:"radio",onChange:"ui.library.sortType = 'points'",checked:this.sortType==="points",name:"sort-games"},{label:"Achieves",id:"sort_achieves",type:"radio",onChange:"ui.library.sortType = 'achievementsCount'",checked:this.sortType==="achievementsCount",name:"sort-games"},{label:"Reverse sort",id:"sort_reverse-sort",type:"checkbox",onChange:"ui.library.sortTypeReverse = this.checked",checked:this.sortTypeReverse==-1,name:"sort-games-reverse"}]});get sortType(){return o.ui?.mobile?.library?.sortType??"title"}set sortType(e){o.ui.mobile.library.sortType=e,o.writeConfiguration(),this.updateGames()}get sortTypeReverse(){return o.ui?.mobile?.library?.sortTypeReverse??1}set sortTypeReverse(e){o.ui.mobile.library.sortTypeReverse=e?-1:1,o.writeConfiguration(),this.updateGames()}get platformFilter(){let e=o.ui?.mobile?.library?.platformFilter??"all";return e=="all"?"all":v[e]}get platformFilterCode(){return o.ui?.mobile?.library?.platformFilter??"all"}set platformFilter(e){o.ui.mobile.library.platformFilter=e,o.writeConfiguration(),this.updateGames(),document.querySelector(".games-platform-filter").innerText=`${this.platformFilter} (${this.games.length})`}titleFilter="";applyFilter(){if(this.games=this.platformFilterCode=="all"?this.GAMES:this.GAMES.filter(e=>e.ConsoleID==this.platformFilterCode),this.titleFilter){let e=new RegExp(this.titleFilter,"gi");this.games=this.games.filter(t=>t?.Title.match(e))}}applySort(){this.games=this.games.sort((e,t)=>this.sortTypeReverse*g[this.sortType](e,t))}constructor(){!o.ui.mobile.library&&(o.ui.mobile.library={}),this.update()}async update(){ui.showLoader(),await T(50),!this.GAMES&&await this.loadGamesArray(),this.applyFilter(),this.applySort();let e=this.LibrarySection();ui.content.innerHTML="",ui.content.append(e),ui.removeLoader(),C({list:this.gameList,items:this.games,callback:M})}updateGames(){this.applyFilter(),this.applySort(),this.gameList.innerHTML="",C({list:this.gameList,items:this.games,callback:M})}LibrarySection(){return this.librarySection=document.createElement("section"),this.librarySection.classList.add("library__section","section"),this.librarySection.appendChild(O(this)),this.gameList=document.createElement("ul"),this.gameList.classList.add("games-list"),this.librarySection.appendChild(this.gameList),this.librarySection}async loadGamesArray(){this.GAMES={},await this.getAllGames()}async getAllGames(){try{this.GAMES=await z("../../../json/games/all_min.json")}catch{return[]}}showHiddenInput(e){console.log("click");let t=e.closest(".hidden-text-input__container");t.classList.add("expanded-input");let a=t.querySelector("input");a.focus(),a.addEventListener("blur",i=>{a.value==""&&t.classList.remove("expanded-input")}),a.addEventListener("input",i=>{this.titleFilter=a.value,this.updateGames()})}};var P=class{constructor(){this.update()}async update(){ui.showLoader(),await delay(50),!this.FAVOURITES&&await this.loadGamesArray();let e=this.FavouritesSection();ui.content.innerHTML="",ui.content.append(e),ui.removeLoader(),C({list:this.gameList,items:this.FAVOURITES,callback:this.getGameElement})}async loadGamesArray(){this.FAVOURITES=Object.values(ui.favouritesGames)}FavouritesSection(){return this.librarySection=document.createElement("section"),this.librarySection.classList.add("favourites__section","section"),this.librarySection.appendChild(this.headerElement()),this.gameList=document.createElement("ul"),this.gameList.classList.add("games-list"),this.librarySection.appendChild(this.gameList),this.librarySection}headerElement(){let e=document.createElement("div");return e.classList.add("section__header-container"),e.innerHTML=`
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
    `,e}getGameElement(e){let t=document.createElement("li");t.classList.add("awards__game-item"),t.dataset.id=e?.ID;let a=e?.ImageIcon.slice(e?.ImageIcon.lastIndexOf("/")+1,e?.ImageIcon.lastIndexOf(".")+1)+"webp";return t.innerHTML=`    
            <li class="awards__game-item" data-id="${e?.ID}">
                <div class="awards__game-container"  onclick="ui.showGameDetails(${e?.ID}); event.stopPropagation()">
                    <div class="awards__game-preview-container" onclick="ui.goto.game(${e?.ID}); event.stopPropagation()">
                        <img class="awards__game-preview" src="../../assets/imgCache/${a}" alt="">
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
        `,t}};var K=()=>fetch("./sections/login.elem").then(e=>e.text()).then(e=>{let t=document.createElement("section");return t.className="login__section",t.innerHTML=e,t}).then(e=>(o.USER_NAME&&(e.querySelector("#login_user-name").value=o.USER_NAME),o.API_KEY&&(e.querySelector("#login__api-key").value=o.API_KEY),o.identConfirmed&&e.querySelector("#login__submit-button").classList.add("verified"),e));var J=()=>{let r=document.createElement("div");return r.classList.add("loading_screen"),r.innerHTML='<div class="loading_screen__loader-icon"></div>',r};var u={},G=class{get favouritesGames(){return o.ui?.mobile?.favouritesGames??{}}get isSoftmode(){return o.ui?.mobile?.isSoftMode??!1}set isSoftmode(e){o.ui.mobile.isSoftMode=e,o.writeConfiguration()}switchGameMode(){this.isSoftmode=!this.isSoftmode,this.home=new S}routes={"/":async()=>{o.identConfirmed?(this.home=new S,this.clearNavbar(),this.navbar.home.classList.add("checked")):this.goto.login()},"/login":async()=>{this.showLoader();let e=await K();content.innerHTML="",content.append(e),this.clearNavbar(),this.navbar.login.classList.add("checked"),this.removeLoader()},"/home":async()=>{o.identConfirmed?(this.home=new S,this.clearNavbar(),this.navbar.home.classList.add("checked")):this.goto.login()},"/awards":async()=>{o.identConfirmed?(this.awards=new L,this.clearNavbar(),this.navbar.awards.classList.add("checked")):this.goto.login()},"/library":async()=>{o.identConfirmed?(this.library=new R,this.clearNavbar(),this.navbar.library.classList.add("checked")):this.goto.login()},"/favourites":async()=>{o.identConfirmed?(this.favourites=new P,this.clearNavbar(),this.navbar.favourites.classList.add("checked")):this.goto.login()},"/game":async e=>{if(o.identConfirmed){let t=e.gameID?parseInt(e.gameID,10):!1;t&&(this.game=new k(t))}else this.goto.login()},"/test":async()=>{content.innerHTML="",content.append(await ie())}};goto={home:()=>{history.pushState(null,null,"#/home"),this.updatePage()},awards:()=>{history.pushState(null,null,"#/awards"),this.updatePage()},library:()=>{history.pushState(null,null,"#/library"),this.updatePage()},favourites:()=>{history.pushState(null,null,"#/favourites"),this.updatePage()},game:e=>{history.pushState(null,null,`#/game&gameID=${e}`),this.updatePage()},login:()=>{history.pushState(null,null,"#/login"),this.updatePage()}};constructor(){!o.ui?.mobile&&(o.ui.mobile={},o.writeConfiguration()),this.initializeElements(),this.addEvents()}initializeElements(){!o.ui.mobile&&(o.ui.mobile={}),this.sectionContainer=document.querySelector(".section-container"),this.app=document.getElementById("app"),this.content=document.getElementById("content"),this.navbar={container:document.querySelector(".navbar"),home:document.querySelector("#navbar_home"),awards:document.querySelector("#navbar_awards"),library:document.querySelector("#navbar_library"),favourites:document.querySelector("#navbar_favourites"),login:document.querySelector("#navbar_login")},o.identConfirmed&&this.navbar.login.classList.add("hidden")}addEvents(){window.addEventListener("hashchange",()=>{this.updatePage()}),window.addEventListener("DOMContentLoaded",()=>{window.dispatchEvent(new Event("hashchange"))}),app.addEventListener("click",()=>{this.removeContext(),this.removePopups()}),app.addEventListener("mousedown",()=>{this.removeContext()})}clearNavbar(){this.navbar.container.querySelectorAll(".checked").forEach(e=>e.classList.remove("checked"))}updatePage(){let e=window.location.hash.substring(1),[t,a]=e.split("&"),i=this.routes[t]||this.routes["/"],s=new URLSearchParams(a),n={};for(let[c,l]of s.entries())n[c]=l;i(n)}removePopups(){document.querySelectorAll(".popup").forEach(e=>e.remove())}removeContext(){document.querySelectorAll(".context").forEach(e=>{e.classList.add("hidden"),setTimeout(()=>e.remove(),1e3)})}async showGameDetails(e){this.removePopups(),this.showLoader();let t=document.createElement("div");t.addEventListener("touchend",s=>s.stopPropagation()),t.classList.add("popup-info__container","popup"),u[e]?(t.innerHTML=this.gamePopupHtml(u[e]),this.content.append(t),this.removeLoader()):_.getGameProgress({gameID:e}).then(s=>{u[e]=s,console.log(s),t.innerHTML=this.gamePopupHtml(s),this.content.append(t)}).then(()=>this.removeLoader());let a=u[e],i=this.gamePopupHtml(a);t.innerHTML=i,await T(500),document.querySelectorAll(".popup-info__image").forEach(s=>{s.addEventListener("click",n=>{n.stopPropagation();let c=document.createElement("div");c.classList.add("image-preview-popup"),c.innerHTML=`
          <img src="${s.src}" alt="">
        `,m.content.appendChild(c),c.addEventListener("click",l=>{l.stopPropagation(),c.remove()})})})}gamePopupHtml(e){return`
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
          href="https://google.com/search?q='${e?.FixedTitle}' '${v[e?.ConsoleID]}' ${se}" target="_blank"></a>
      <a class="round-button icon-button redirect-icon simple-button game-popup__ra-button"
          href="https://retroachievements.org/game/${e?.ID}" target="_blank"></a>
      <button class="${m.favouritesGames[e?.ID]?"checked":""} round-button icon-button like-icon simple-button game-popup__like-button"
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
    `}async showAchivDetails(e,t){if(this.removePopups(),this.showLoader(),u[t]){let a=document.createElement("div");a.addEventListener("touchend",n=>n.stopPropagation()),a.classList.add("popup-info__container","popup");let i=u[t].Achievements[e],s=this.achivPopupHtml(i);a.innerHTML=s,this.content.append(a),this.removeLoader()}else{let a=await _.getGameProgress({gameID:t});u[t]=a,this.showAchivDetails(e,t)}}achivPopupHtml(e){return`
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
  `}expandGameItem(e,t){let a=t.closest("li");a.classList.toggle("expanded");let i=s=>{this.showLoader();let n=w(`
        <div class="user-info__game-achivs-container">
            <ul class ="user-info__game-achivs-list"/>
        </div>
      `),c=n.querySelector("ul");a.appendChild(n),u[s]?(Object.values(u[s].Achievements).sort((l,p)=>g.date(l,p)).forEach(l=>{c.innerHTML+=this.achivHtml(l,s)}),this.removeLoader()):_.getGameProgress({gameID:s}).then(l=>{u[s]=l,Object.values(l.Achievements).sort((p,d)=>g.date(p,d)).forEach(p=>{c.innerHTML+=this.achivHtml(p,s)})}).then(()=>this.removeLoader())};a.querySelector(".user-info__game-achivs-container")??i(e)}achivHtmlList(e,t){return`    
            <li class="user-info__achiv-container"  onclick="ui.showAchivDetails(${e.ID},${t}); event.stopPropagation();">                
                <div class="user-info__achiv-preview-container">
                    <img class="user-info__achiv-preview ${(e.isHardcoreEarned||m.isSoftmode&&e.isEarned)&&"earned"}" src="${e.prevSrc}" alt="">
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
                    <img class="user-info__achiv-preview ${(e.isHardcoreEarned||m.isSoftmode&&e.isEarned)&&"earned"}" src="${e.prevSrc}" alt="">
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
        `}showLoader(){this.removeLoader(),this.app.append(J())}removeLoader(){document.querySelectorAll(".loading_screen").forEach(e=>e.remove())}},ie=()=>fetch("./sections/test.elem").then(e=>e.text()).then(e=>{let t=document.createElement("section");return t.className="test__section section",t.innerHTML=e,t});var se="site:www.romhacking.net OR site:wowroms.com/en/roms OR site:cdromance.org OR site:coolrom.com.au/roms OR site:planetemu.net OR site:emulatorgames.net OR site:romsfun.com/roms OR site:emu-land.net/en";function Y(r,e){e.stopPropagation(),ui.removeContext();let t=document.createElement("div");t.classList.add("context-menu__container","context"),t.addEventListener("touchend",s=>s.stopPropagation()),t.addEventListener("mousedown",s=>s.stopPropagation()),t.innerHTML+=`
    <div class="context__header" onclick="ui.removeContext()">${r.label}</div>
  `;let a=()=>{let s=document.createElement("div");return s.classList.add("context__controls"),r.elements.forEach(n=>{switch(n.type){case"radio":s.innerHTML+=`
            <div class="context__radio">
              <input type="radio" onchange="${n.onChange}"
                    name="${n.name}" ${n.checked&&"checked"} id="${n.id}">
              <label class="context__radio-label" for="${n.id}">${n.label}</label>
            </div>
          `;break;case"checkbox":s.innerHTML+=`
            <div class="context__checkbox">
              <input type="checkbox" onchange="${n.onChange}"
                    name="${n.name}" ${n.checked&&"checked"} id="${n.id}">
              <label class="context__checkbox-label" for="${n.id}">${n.label}</label>
            </div>
          `;break;default:return""}}),s},i=document.createElement("div");i.classList.add("context__control-container"),i.append(a(r)),t.append(i),ui.app.appendChild(t)}var o=new I,_=new D,m=new G;window.ui=m;window.generateContextMenu=Y;window.submitRAData=()=>{let r=m.content.querySelector("#login_user-name").value,e=m.content.querySelector("#login__api-key").value;_.verifyUserIdent({userName:r,apiKey:e}).then(t=>{if(t.ID)re({userName:r,apiKey:e,userObj:t}),setTimeout(()=>{m.goto.home(),location.reload(!0)},1e3);else{o.identConfirmed=!1;let a=m.content.querySelector("#login__submit-button");a.classList.add("error"),a.classList.remove("verified")}})};function re({userName:r,apiKey:e,userObj:t}){o.USER_NAME=r,o.API_KEY=e,o.identConfirmed=!0,o.userImageSrc=`https://media.retroachievements.org${t?.UserPic}`;let a=m.content.querySelector("#login__submit-button");a.classList.remove("error"),a.classList.add("verified")}})();
