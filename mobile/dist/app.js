(()=>{var g={date:(s,e)=>{let t=s.DateEarned?new Date(s.DateEarnedHardcore?s.DateEarnedHardcore:s.DateEarned):-1/0;return(e.DateEarned?new Date(e.DateEarnedHardcore?e.DateEarnedHardcore:e.DateEarned):-1/0)-t},earnedCount:(s,e)=>e.NumAwardedHardcore-s.NumAwardedHardcore,points:(s,e)=>parseInt(s.Points)-parseInt(e.Points),truepoints:(s,e)=>s.TrueRatio-e.TrueRatio,default:(s,e)=>s.DisplayOrder===0?g.id(s,e):s.DisplayOrder-e.DisplayOrder,id:(s,e)=>s.ID-e.ID,disable:(s,e)=>0,achievementsCount:(s,e)=>parseInt(s.NumAchievements)-parseInt(e.NumAchievements),title:(s,e)=>{let t=s.Title?.toUpperCase()??s.FixedTitle.toUpperCase(),a=e.Title?.toUpperCase()??e.FixedTitle.toUpperCase();return t<a?-1:t>a?1:0},award:(s,e)=>{let t={event:6,mastered:5,"beaten-hardcore":4,completed:3,"beaten-softcore":2,started:1},a=t[e.award]??0,i=t[s.award]??0,o=new Date(e.AwardedAt),n=new Date(s.AwardedAt);return a-i!=0?a-i:o-n}};var I=class{get _savedCompletionProgress(){return r._cfg?.apiWorker?.completionProgress??{}}get SAVED_COMPLETION_PROGRESS(){let e=this._savedCompletionProgress;return!e?.Total||r._cfg.apiWorker.targetUser!==r.targetUser?this.updateCompletionProgress({batchSize:500}).then(()=>this._savedCompletionProgress):this.updateCompletionProgress({batchSize:20,savedArray:e.Results}).then(()=>this._savedCompletionProgress)}set SAVED_COMPLETION_PROGRESS(e){e.Results=e.Results.map(t=>(delete t.ConsoleName,delete t.NumLeaderboards,t)),r._cfg.apiWorker||(r._cfg.apiWorker={}),r._cfg.apiWorker.targetUser=r.targetUser,r._cfg.apiWorker.completionProgress=e,r.writeConfiguration()}baseUrl="https://retroachievements.org/API/";endpoints={userProfile:"API_GetUserProfile.php",gameProgress:"API_GetGameInfoAndUserProgress.php",recentAchieves:"API_GetUserRecentAchievements.php",gameInfo:"API_GetGame.php",extendedGameInfo:"API_GetGameExtended.php",recentlyPlayedGames:"API_GetUserRecentlyPlayedGames.php",userAwards:"API_GetUserAwards.php",userGameRankAndScore:"API_GetUserGameRankAndScore.php",completionProgress:"API_GetUserCompletionProgress.php",gameList:"API_GetGameList.php",userSummary:"API_GetUserSummary.php",wantToPlay:"API_GetUserWantToPlayList.php"};async getLastUnlocks({apiKey:e,targetUser:t}){let a=new URL(this.endpoints.recentAchieves,this.baseUrl),i={y:e||r.API_KEY,u:t||r.targetUser,m:1440*31};return a.search=new URLSearchParams(i),(await fetch(a).then(c=>c.json()))?.map(c=>({...c,ID:c.AchievementID,DateEarned:c.Date})).sort((c,l)=>g.date(c,l))??[];return[{ID:383065,GameID:1891,GameTitle:"Puzznic",Title:"Enigma Explorer",Description:"Reach a score of 50,000 in Puzznic",Points:2,Type:null,BadgeName:"432937",IsAwarded:"1",DateAwarded:"2026-06-05 17:13:14",HardcoreAchieved:1},{ID:383073,GameID:1891,GameTitle:"Puzznic",Title:"Puzznic Level 1 - Riddle Ridge",Description:"In a single session, complete all of the Puzznic puzzles on level 1 [No continues]",Points:3,Type:"progression",BadgeName:"432901",IsAwarded:"1",DateAwarded:"2026-06-05 17:11:57",HardcoreAchieved:1}]}getUrl({endpoint:e,targetUser:t,gameID:a,minutes:i,apiKey:o,userName:n,achievesCount:c,count:l,offset:m}){let p=new URL(e,this.baseUrl),_={y:o||r.API_KEY,z:n||r.USER_NAME,u:t||r.targetUser,g:a||r.gameID,m:i||2e3,i:a||r.gameID,f:1,h:1,a:c||5,c:l||20,o:m||0};return p.search=new URLSearchParams(_),p}constructor(){}getUserCompelitionProgress({targetUser:e,count:t,offset:a}){let i=this.getUrl({targetUser:e||r.targetUser,count:t||100,offset:a||0,endpoint:this.endpoints.completionProgress});return fetch(i).then(o=>o.json()).then(o=>(o.Results=o.Results.map(n=>(n.ID=n.GameID,n.NumAchievements=n.MaxPossible,delete n.MaxPossible,delete n.NumLeaderboards,n)),o))}getUserAwards({targetUser:e}){let t=this.getUrl({targetUser:e||r.targetUser,endpoint:this.endpoints.userAwards});return fetch(t).then(a=>a.json()).then(a=>(a.VisibleUserAwards=a.VisibleUserAwards.map(i=>["Mastery/Completion","Game Beaten"].includes(i.AwardType)?(i.award=i.AwardType=="Game Beaten"?i.AwardDataExtra=="1"?"beaten":"beaten_softcore":i.AwardDataExtra=="1"?"mastered":"completed",i.DateEarned=i.AwardedAt,i.ConsoleName=="Events"&&(i.award="event"),i.timeString=this.toLocalTimeString(i.AwardedAt),i=this.fixGameTitle(i),i):null).filter(i=>i),a))}getGameProgress({targetUser:e,gameID:t}){let a=this.getUrl({endpoint:this.endpoints.gameProgress,targetUser:e||r.targetUser,gameID:t||r.gameID});return fetch(a).then(i=>i.json()).then(i=>{i={...i,TotalRealPlayers:0,TotalRetropoints:0,points_total:0,progressionRetroRatio:0,beatenCount:1/0,masteredCount:1/0,earnedStats:{soft:{count:0,points:0,retropoints:0},hard:{count:0,points:0,retropoints:0}}};let o={Count:0,WinCount:0,WinAwardedCount:0,WinEarnedCount:0},n={isBeaten:!0,isBeatenSoftcore:!0,isWinEarned:!1,isWinEarnedSoftcore:!1};for(let l of Object.values(i.Achievements))i.TotalRetropoints+=l.TrueRatio,i.points_total+=l.Points,i.TotalRealPlayers<l.NumAwarded&&(i.TotalRealPlayers=l.NumAwarded),l.DateEarned&&(i.earnedStats.soft.count+=1,i.earnedStats.soft.points+=l.Points,i.earnedStats.soft.retropoints+=l.TrueRatio),l.DateEarnedHardcore&&(i.earnedStats.hard.count+=1,i.earnedStats.hard.points+=l.Points,i.earnedStats.hard.retropoints+=l.TrueRatio),l.type==="progression"&&(o.Count++,l.DateEarned?l.DateEarnedHardcore||(n.isBeaten=!1):(n.isBeaten=!1,n.isBeatenSoftcore=!1),i.beatenCount>l.NumAwardedHardcore&&(i.beatenCount=l.NumAwardedHardcore)),l.type==="win_condition"&&(l.DateEarnedHardcore?(n.isWinEarned=!0,n.isWinEarnedSoftcore=!0):l.DateEarned&&(n.isWinEarnedSoftcore=!0),o.WinCount++,l.NumAwardedHardcore>o.WinAwardedCount&&(o.WinAwardedCount=l.NumAwardedHardcore),l.DateEarnedHardcore&&o.WinEarnedCount++),l.NumAwardedHardcore<i.masteredCount&&(i.masteredCount=l.NumAwardedHardcore);i.achievements_published==i.NumAwardedToUserHardcore?i.award="mastered":n.isBeaten&&(n.isWinEarned||o.WinCount==0)&&(i.award="beaten"),i={...i,winVariantCount:o.WinCount,winEarnedCount:o.WinEarnedCount,progressionSteps:o.WinCount>0?o.Count+1:o.Count},o.WinCount>0&&(i.beatenCount=o.WinAwardedCount),i.beatenCount!=1/0&&(i.beatenRate=~~(1e4*i.beatenCount/i.TotalRealPlayers)/100),i.masteredCount!=1/0&&(i.masteryRate=~~(1e4*i.masteredCount/i.TotalRealPlayers)/100);let c=~~(i.TotalRetropoints/i.points_total*100)/100;return i.retroRatio=c,i.gameDifficulty=c>9?"insane":c>7?"expert":c>5?"pro":c>3?"standard":"easy",Object.values(i.Achievements).map(l=>this.fixAchievement(l,i)),i=this.fixGameTitle(i),i})}getGameInfo({gameID:e,extended:t}){let a=this.getUrl({endpoint:this.endpoints[t?"extendedGameInfo":"gameInfo"],gameID:e});return fetch(a).then(i=>i.json())}getUserProfile({userName:e}){let t=this.getUrl({targetUser:e,userName:e,endpoint:this.endpoints.userProfile});return fetch(t).then(a=>a.json())}getUserSummary({targetUser:e,gamesCount:t=3,achievesCount:a}){let i=this.getUrl({targetUser:e,gameID:t,achievesCount:a,endpoint:this.endpoints.userSummary});return fetch(i).then(o=>o.json()).then(o=>(o.RecentlyPlayed=o.RecentlyPlayed.map(n=>(n.LastPlayed=this.toLocalTimeString(n.LastPlayed),o.Awarded[n.GameID]&&(n={...n,...o.Awarded[n.GameID]}),n=this.fixGameTitle(n),n)),o.RecentAchievements=Object.values(o.RecentAchievements).flatMap(n=>Object.values(n)).map(n=>(n.DateEarned=this.toLocalTimeString(n.DateAwarded),n)),o.isInGame=new Date-new Date(o.RecentlyPlayed[0].LastPlayed)<300*1e3,o))}verifyUserIdent({userName:e,apiKey:t}){let a=this.getUrl({targetUser:e,userName:e,apiKey:t,endpoint:this.endpoints.userProfile});return fetch(a).then(i=>i.json())}getGameList({userName:e,apiKey:t,systemID:a}){let i=this.getUrl({userName:e,apiKey:t,gameID:a,endpoint:this.endpoints.gameList});return fetch(i).then(o=>o.json())}doTestEndpoint({endpoint:e}){let t=this.getUrl({endpoint:e});return fetch(t).then(a=>a.json()).then(a=>console.log(a))}async updateCompletionProgress({savedArray:e=[],completionProgress:t=[],batchSize:a=500}){let i=await this.getUserCompelitionProgress({count:a,offset:t.length});t=[...t,...i.Results];let o=t.at(-1);if(e.findIndex(c=>c.hasOwnProperty("GameID")&&c.GameID===o.GameID&&c.MostRecentAwardedDate===o.MostRecentAwardedDate)>=0||t.length===i.Total){let c=t.map(l=>l.GameID);e=e.filter(l=>!c.includes(l.GameID)),e=[...t,...e],this.SAVED_COMPLETION_PROGRESS={Total:e.length,Results:e}}else setTimeout(()=>this.updateCompletionProgress({savedArray:e,completionProgress:t,batchSize:a}),100)}fixAchievement(e,t){let{BadgeName:a,DateEarned:i,DateEarnedHardcore:o,NumAwardedHardcore:n,NumAwarded:c,TrueRatio:l,ID:m}=e,{NumDistinctPlayers:p,NumAwardedToUserHardcore:_,TotalRealPlayers:$}=t,C=100*(n-_*.5)/((p+$)*.5-_*.5);t.Achievements[m]={...e,totalPlayers:p,isEarned:!!i,isHardcoreEarned:!!o,DateEarned:i&&this.toLocalTimeString(i),DateEarnedHardcore:o&&this.toLocalTimeString(o),prevSrc:`https://media.retroachievements.org/Badge/${a}.png`,rateEarned:~~(100*c/p)+"%",rateEarnedHardcore:~~(100*n/p)+"%",trend:C,difficulty:C<1.5&&l>300||l>=500?"hell":C<=3&&l>100||l>=300?"insane":C<8&&l>24?"expert":C<13&&l>10?"pro":C<20&&l>5||l>10?"standard":"easy"}}fixGameTitle(e){let t=[/\[SUBSET[^\[]*\]/gi,/~[^~]*~/g,".HACK//"],a=e.Title,i=t.reduce((o,n)=>{let c=new RegExp(n,"gi"),l=e.Title?.match(c);return l&&l.forEach(m=>{a=a.replace(m,"");let p=m;o.push(p.replace(/[~\.\[\]]|subset -|\/\//gi,""))}),o},[]);return e.badges=i,e.FixedTitle=a?.trim(),e}toLocalTimeString(e){!/(\+00\:00$)|(z$)/gi.test(e)&&(e+="+00:00");let a=new Date(e),i={day:"2-digit",month:"2-digit",year:"numeric",hour:"2-digit",minute:"2-digit",hour12:!1};return a}async getWantToPlayGamesList({apiKey:e,targetUser:t,count:a,offset:i}){let o=new URL(this.endpoints.wantToPlay,this.baseUrl),n={y:e||r.API_KEY,u:t||r.targetUser,o:i||0};return o.search=new URLSearchParams(n),(await fetch(o).then(l=>l.json())).Results||[]}};var M="retroApiConfig",E=class{get version(){return this._cfg.version??"0"}set version(e){this._cfg.version=e,this.writeConfiguration()}get API_KEY(){return this._cfg.identification.RAApi_key}set API_KEY(e){this._cfg.identification.RAApi_key=e,this.writeConfiguration()}get USER_NAME(){return this._cfg.identification.RAApi_login}set USER_NAME(e){this._cfg.identification.RAApi_login=e,this.writeConfiguration()}get identConfirmed(){return this._cfg.identification.identConfirmed??!1}set identConfirmed(e){this._cfg.identification.identConfirmed=e,this.writeConfiguration()}get userImageSrc(){return this._cfg.identification.userImageSrc||""}set userImageSrc(e){this._cfg.identification.userImageSrc=e,this.ui.buttons&&(ui.buttons.userImage.src=e),this.writeConfiguration()}get targetUser(){return this._cfg.settings.targetUser||this.USER_NAME}set targetUser(e){this._cfg.settings.targetUser=e,this.writeConfiguration(),this.identConfirmed&&(ui.settings.getLastGameID(),ui.awards.updateAwards())}get gameID(){return this._cfg.settings.gameID}set gameID(e){this._cfg.settings.gameID=e,this.writeConfiguration()}get ui(){return this._cfg.ui}constructor(){this.readConfiguration()}readConfiguration(){let e=JSON.parse(localStorage.getItem(M));e||(e={identification:{RAApi_key:"",RAApi_login:""},settings:{updateDelay:15,sort:"default",gameID:1},ui:{}}),this._cfg=e,localStorage.setItem(M,JSON.stringify(this._cfg)),this.writeConfiguration()}delayedWrite;writeConfiguration(){clearTimeout(this.delayedWrite),this.delayedWrite=setTimeout(()=>{localStorage.setItem(M,JSON.stringify(this._cfg))},1e3)}};function y(s){return s?.reduce((e,t)=>e+=`<i class="game-badge game-badge__${t.toLowerCase()}">${t}</i>`,"")}var F={points:`
        <svg style="bottom:-5px" fill="#a33fff" version="1.1" id="Capa_1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="14px" height="12px" viewBox="20 20 401.601 401.6" xml:space="preserve" stroke="#6b1be4">
            <g id="SVGRepo_bgCarrier" stroke-width="0"/>
            <g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"/>
            <g id="SVGRepo_iconCarrier"> <g> <g> <path d="M116.682,229.329c11.286,0,22.195-0.729,32.518-2.086V114.094c-10.322-1.356-21.232-2.085-32.518-2.085 c-64.441,0-116.681,23.693-116.681,52.921v11.477C0.001,205.634,52.241,229.329,116.682,229.329z"/> <path d="M116.682,288.411c11.286,0,22.195-0.729,32.518-2.084v-33.166c-10.325,1.356-21.229,2.095-32.518,2.095 c-56.25,0-103.199-18.054-114.227-42.082c-1.606,3.5-2.454,7.124-2.454,10.839v11.477 C0.001,264.718,52.241,288.411,116.682,288.411z"/> <path d="M149.199,314.823v-2.578c-10.325,1.356-21.229,2.095-32.518,2.095c-56.25,0-103.199-18.054-114.227-42.082 C0.848,275.757,0,279.381,0,283.096v11.477c0,29.229,52.24,52.922,116.681,52.922c12.887,0,25.282-0.95,36.873-2.7 c-2.873-5.877-4.355-12.075-4.355-18.496V314.823z"/> <path d="M284.92,22.379c-64.441,0-116.681,23.693-116.681,52.921v11.477c0,29.228,52.24,52.921,116.681,52.921 c64.44,0,116.681-23.693,116.681-52.921V75.3C401.601,46.072,349.36,22.379,284.92,22.379z"/> <path d="M284.92,165.626c-56.25,0-103.199-18.053-114.227-42.082c-1.606,3.499-2.454,7.123-2.454,10.839v11.477 c0,29.228,52.24,52.921,116.681,52.921c64.44,0,116.681-23.693,116.681-52.921v-11.477c0-3.716-0.848-7.34-2.454-10.839 C388.119,147.573,341.17,165.626,284.92,165.626z"/> <path d="M284.92,224.71c-56.25,0-103.199-18.054-114.227-42.082c-1.606,3.499-2.454,7.123-2.454,10.839v11.477 c0,29.229,52.24,52.922,116.681,52.922c64.44,0,116.681-23.693,116.681-52.922v-11.477c0-3.716-0.848-7.34-2.454-10.839 C388.119,206.657,341.17,224.71,284.92,224.71z"/> <path d="M284.92,286.983c-56.25,0-103.199-18.054-114.227-42.082c-1.606,3.5-2.454,7.123-2.454,10.838v11.478 c0,29.228,52.24,52.921,116.681,52.921c64.44,0,116.681-23.693,116.681-52.921v-11.478c0-3.715-0.848-7.34-2.454-10.838 C388.119,268.928,341.17,286.983,284.92,286.983z"/> <path d="M284.92,346.066c-56.25,0-103.199-18.053-114.227-42.081c-1.606,3.5-2.454,7.125-2.454,10.838V326.3 c0,29.228,52.24,52.921,116.681,52.921c64.44,0,116.681-23.693,116.681-52.921v-11.478c0-3.715-0.848-7.34-2.454-10.838 C388.119,328.012,341.17,346.066,284.92,346.066z"/> </g> </g> </g>

        </svg>`};function D(s){return new Date(s).toLocaleString()}var v=s=>{/\/>/g.test(s)&&(s=s.replace(/<(\w+)([^>]*)\/>/g,(t,a,i)=>new Set(["area","base","br","col","embed","hr","img","input","link","meta","param","source","track","wbr"]).has(a.toLowerCase())?t:`<${a}${i}></${a}>`));let e=document.createElement("template");return e.innerHTML=s.trim(),e.content.firstElementChild};function B(s){let e=+(s.retropoints/s.hardpoints).toFixed(2);return`
        <div class="section__header-container user-info__header-container">
            <div class="user-info__header">
                <div class="user-info__avatar-container">
                    <img class="user-info__avatar" src="${s.userImageSrc}" onclick="ui.goto.login()">
                    ${e?`<span class="game-header__retro-ratio  achiv-rarity__standard">${e}</span>`:""}
                </div>
                <button class="button__switch-mode ${d.isSoftmode?"softmode":""}" onclick="ui.switchGameMode()">${d.isSoftmode?"SOFT":"HARD"}</button>
                <div class="user-info__user-name-container">
                    <h1 class="user-info__user-name">${s.userName}</h1>
                    <div class="user-info__user-rank">${s.userRank}</div>
                    <div class="user-info__rich-presence">Member since: ${new Date(s.memberSince).toLocaleDateString()}</div>
                </div>
            </div>
            ${s.isInGame?`
            <div class="user-info__rich-presence"> ${s.richPresence}</div>
            `:""}
            
            
        </div>
    `}var W=({BadgeName:s})=>`https://media.retroachievements.org/Badge/${s}.png`,S=s=>`https://media.retroachievements.org${s}`;function U(s){let{Title:e,Description:t,ID:a,GameID:i,HardcoreAchieved:o,IsAwarded:n,DateEarned:c,BadgeName:l,Points:m}=s;return`
        <li class="user-info__cheevo-container">
            <div class="user-info__cheevo-title-container" 
                onclick="ui.showAchivDetails(${a}, ${i}); event.stopPropagation()">
                <div class="user-info__cheevo-preview-container">
                    <img class="user-info__cheevo-preview ${o||d.isSoftmode&&n?"earned":""}"
                        src="${W({BadgeName:l})}">
                </div>
                <div class="user-info__cheevo-descriptions">
                    <h2 class="user-info__cheevo-title">${e}</h2>
                    <p class="user-info__cheevo-description">${t}</p>
                    <div class="user-info__cheevo-stats-container">
                        <p class="user-info__cheevo-stats-text points">
                        ${F.points} ${m} Points</p>
                        <p class="game-stats__text cheevo-stats__unlocked">${Z(c)}</p>
                    </div>
                </div>
            </div>
        </li>`}function z({lastAchievements:s}){return s.reduce((e,t)=>{let a=U(t);return e+=a,e},"")}var Z=s=>{let e=new Date(s),t=e.getTime(),a=Date.now(),i=Math.round((a-e)/6e4);if(i<2)return"just now";if(i<60)return i+" minutes ago";let o=Math.round(i/60);return o<24?o+" hours ago":e.toLocaleString()};function j(s){let{GameID:e,ImageIcon:t,FixedTitle:a,badges:i,LastPlayed:o,ConsoleName:n,NumAchieved:c,NumAchievedHardcore:l,NumPossibleAchievements:m,ScoreAchieved:p,ScoreAchievedHardcore:_,PossibleScore:$}=s;return`    
        <li class="user-info__last-game-container" data-id="${e}">
            <div class="user-info__game-main-info"  onclick="ui.showGameDetails(${e}); event.stopPropagation()">
                <div class="user-info__game-preview-container" onclick="ui.goto.game(${e}); event.stopPropagation()">
                    <img class="user-info__game-preview" src="${S(t)}" alt="">
                </div>
                <div class="user-info__game-description" >
                    <h2 class="user-info__game-title">${a} ${y(i)}</h2>
                    <div class="game-stats__text">${D(o)} | ${n}</div>
                    <div  class="game-stats__button"  onclick="ui.expandGameItem(${e},this); event.stopPropagation()">
                        <i class="game-stats__icon game-stats__expand-icon"></i>
                    </div>
                    <div class="user-info_game-stats-container">
                        <div class="game-stats ">
                            <i class="game-stats__icon game-stats__achivs-icon"></i>
                            <div class="game-stats__text">${ui.isSoftmode?c:l} / ${m}</div>
                            </div>
                            <div class="game-stats game-stats__points">
                            <i class="game-stats__icon game-stats__points-icon"></i>
                            <div class="game-stats__text">${ui.isSoftmode?p:_} / ${$}</div>
                        </div>
                    </div>
                </div>
            </div>
        </li>
        `}function q({lastGames:s}){return s.reduce((e,t)=>{let a=j(t);return e+=a,e},"")}var x,T=class{constructor(){this.update()}async update(){if(d.showLoader(),x){let e=this.HomeSection();d.content.innerHTML="",d.content.append(e),d.removeLoader()}else await this.loadUserInfo(),this.update()}async loadUserInfo(){let e=await h.getUserSummary({gamesCount:5,achievesCount:8});x={userName:e.User,status:e.Status?.toLowerCase(),richPresence:e.RichPresenceMsg,memberSince:e.MemberSince,userImageSrc:`https://media.retroachievements.org${e.UserPic}`,userRank:e.Rank?`Rank: ${e.Rank} (Top ${~~(1e4*e.Rank/e.TotalRanked)/100}%)`:"Rank is unavailable",softpoints:e.TotalSoftcorePoints,retropoints:e.TotalTruePoints,hardpoints:e.TotalPoints,lastGames:e.RecentlyPlayed,lastAchievements:Object.values(e.RecentAchievements).map(t=>(t.DateEarnedHardcore=t.DateAwarded,t)).sort((t,a)=>g.date(t,a)),isInGame:e.isInGame}}HomeSection(){let e=v(`
            <section class="home__section section">
                ${B(x)}
                <div class="user-info__container">
                    <ul class="user-info__last-games-list">
                        <button id="see-more-cheevos" class="user-info__block-header">
                            <h2>Last Unlocks</h2>
                            <p>See more</p>
                        </button>
                        ${z(x)}
                        <button  class="user-info__block-header">
                            <h2>Recently Played</h2>
                            <p style="display:none">See more</p>
                        </button>
                        ${q(x)}
                    </ul>
                </div>
            </section
        `);return e.querySelector("#see-more-cheevos")?.addEventListener("click",t=>{d.goto.unlocks()}),e}};var w=s=>new Promise(e=>setTimeout(e,s));function b({list:s,items:e,callback:t}){let a=document.createElement("div");a.classList.add("lazy-load_trigger"),s.appendChild(a);let i=0,o=40,n=p=>{for(let _=0;_<p&&i<e.length;_++)s.appendChild(t(e[i++]))};n(o);let c=(p,_)=>{p.forEach($=>{$.isIntersecting&&(n(o),_.unobserve(a),i<e.length?(s.appendChild(a),_.observe(a)):a.remove())})},l={root:null,rootMargin:"0px",threshold:1};new IntersectionObserver(c,l).observe(a)}var f={1:"Genesis/Mega Drive",2:"Nintendo 64",3:"SNES/Super Famicom",4:"Game Boy",5:"Game Boy Advance",6:"Game Boy Color",7:"NES/Famicom",8:"PC Engine/TurboGrafx-16",9:"Sega CD",10:"32X",11:"Master System",12:"PlayStation",13:"Atari Lynx",14:"Neo Geo Pocket",15:"Game Gear",17:"Atari Jaguar",18:"Nintendo DS",19:"Nintendo Wii",21:"PlayStation 2",23:"Magnavox Odyssey 2",24:"Pokemon Mini",25:"Atari 2600",27:"Arcade",28:"Virtual Boy",29:"MSX",33:"SG-1000",37:"Amstrad CPC",38:"Apple II",39:"Saturn",40:"Dreamcast",41:"PlayStation Portable",43:"3DO Interactive Multiplayer",44:"ColecoVision",45:"Intellivision",46:"Vectrex",47:"PC-8000/8800",49:"PC-FX",51:"Atari 7800",53:"WonderSwan",56:"Neo Geo CD",57:"Fairchild Channel F",63:"Watara Supervision",69:"Mega Duck",71:"Arduboy",72:"WASM-4",73:"Arcadia 2001",74:"Interton VC 4000",75:"Elektor TV Games Computer",76:"PC Engine CD/TurboGrafx-CD",77:"Atari Jaguar CD",78:"Nintendo DSi",80:"Uzebox",101:"Events",102:"Standalone"};var A,L=class{awardTypeContext=()=>({label:"Filter by type",elements:[{label:`All (${A.VisibleUserAwards.length})`,id:"filter_all",type:"radio",onChange:"ui.awards.awardFilter = 'award'",checked:this.awardFilterName==="award",name:"filter-by-award"},...Object.getOwnPropertyNames(this.awardTypes).reduce((e,t)=>{let a={label:`${this.awardTypes[t].name} (${this.awardTypes[t].count})`,id:`filter_code-${t}`,type:"radio",onChange:`ui.awards.awardFilter = '${t}'`,checked:this.awardFilterName==t,name:"filter-by-award"};return e.push(a),e},[])]});awardPlatformContext=()=>({label:"Filter by platform",elements:[{label:`All (${A.VisibleUserAwards.length})`,id:"filter_all",type:"radio",onChange:"ui.awards.platformFilterCode = 'platform'",checked:this.platformFilterName==="platform",name:"filter-by-platform"},...Object.getOwnPropertyNames(this.platformCodes).reduce((e,t)=>{let a={label:`${this.platformCodes[t].name} (${this.platformCodes[t].count})`,id:`filter_code-${t}`,type:"radio",onChange:`ui.awards.platformFilterCode = ${t}`,checked:this.platformFilterCode==t,name:"filter-by-platform"};return e.push(a),e},[])]});awardSortContext=()=>({label:"Sort by",elements:[{label:"Date earned",id:"sort_date-earned",type:"radio",onChange:"ui.awards.awardSortType = 'date'",checked:this.awardSortType==="date",name:"sort-awards"},{label:"Type",id:"sort_award-type",type:"radio",onChange:"ui.awards.awardSortType = 'award'",checked:this.awardSortType==="award",name:"sort-awards"},{label:"Title",id:"sort_title",type:"radio",onChange:"ui.awards.awardSortType = 'title'",checked:this.awardSortType==="title",name:"sort-awards"},{label:"Reverse sort",id:"sort_reverse-sort",type:"checkbox",onChange:"ui.awards.awardSortTypeReverse = this.checked",checked:this.awardSortTypeReverse==-1,name:"sort-awards-reverse"}]});awardListContext=()=>({label:"Show by",elements:[...Object.getOwnPropertyNames(this.listTypes).reduce((e,t)=>{let a={label:`${this.listTypes[t]}`,id:`awards_list-type-${t}`,type:"radio",onChange:`ui.awards.listType = '${t}'`,checked:this.listType==t,name:"awards-list-type"};return e.push(a),e},[])]});get listType(){return r.ui?.mobile?.listType??"list"}set listType(e){r.ui.mobile.listType=e,r.writeConfiguration(),this.update()}get awardFilter(){let e=r.ui?.mobile?.awardsTypeFilter??"award";return this.awardTypesNames[e]}get awardFilterName(){return r.ui?.mobile?.awardsTypeFilter??"award"}set awardFilter(e){r.ui.mobile.awardsTypeFilter=e,r.writeConfiguration(),this.update()}get platformFilterName(){let e=r.ui?.mobile?.platformFilter??"platform";return e=="platform"?"platform":f[e]}get platformFilterCode(){return r.ui?.mobile?.platformFilter??"platform"}set platformFilterCode(e){r.ui.mobile.platformFilter=e,r.writeConfiguration(),this.update()}get awardSortType(){return r.ui?.mobile?.awardSortType??"date"}set awardSortType(e){r.ui.mobile.awardSortType=e,r.writeConfiguration(),this.update()}get awardSortTypeReverse(){return r.ui?.mobile?.awardSortTypeReverse??"1"}set awardSortTypeReverse(e){r.ui.mobile.awardSortTypeReverse=e?-1:1,r.writeConfiguration(),this.update()}applySort(){this.awardedGames=this.awardedGames.sort((e,t)=>this.awardSortTypeReverse*g[this.awardSortType](e,t))}applyFilter(){this.awardedGames=A.VisibleUserAwards,this.awardFilterName!=="award"&&(this.awardedGames=this.awardedGames.filter(e=>e.award==this.awardFilterName)),this.platformFilterCode!=="platform"&&(this.awardedGames=this.awardedGames.filter(e=>e.ConsoleID==this.platformFilterCode))}listTypes={list:"list",grid:"grid"};awardTypesNames={beaten:"Beaten",beaten_softcore:"Beaten Softcore",completed:"Completed",mastered:"Mastered",event:"Event",award:"Award Type"};sortMethods={latest:"date",title:"title"};awardedGames=[];constructor(){!r.ui.mobile.awards&&(r.ui.mobile.awards={}),ui.showLoader(),this.downloadAwardsData().then(()=>{this.getAwardsStats(),this.update()})}async update(){ui.showLoader(),await w(50),this.applyFilter(),this.applySort();let e=this.AwardsSection();ui.content.innerHTML="",ui.content.append(e),ui.removeLoader();let t=e.querySelector(".user-info__awards-list");b({list:t,items:this.awardedGames,callback:this.getGameElement})}getAwardsStats(){let e=A.VisibleUserAwards.reduce((t,a)=>(!t.platforms[a.ConsoleID]&&(t.platforms[a.ConsoleID]={count:0}),t.platforms[a.ConsoleID].name=a.ConsoleName,t.platforms[a.ConsoleID].count++,!t.awards[a.award]&&(t.awards[a.award]={count:0}),t.awards[a.award].name=this.awardTypesNames[a.award],t.awards[a.award].count++,t),{platforms:{},awards:{}});this.platformCodes=e.platforms,this.awardTypes=e.awards}async downloadAwardsData(){!A&&(A=await h.getUserAwards({}))}AwardsSection(){let e=document.createElement("section");return e.classList.add("awards__section","section"),e.innerHTML=`
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
  `,t}};var V={earned:s=>!!s.DateEarnedHardcore,notEarned:s=>!s.DateEarnedHardcore,missable:s=>s.type==="missable",progression:s=>s.type==="progression"||s.type==="win_condition",all:()=>!0};var k=class{filterContext=()=>({label:"Filter by",elements:[{label:"Progression",id:"filter_progression",type:"radio",onChange:"ui.game.filter = 'progression'",checked:this.filter==="progression",name:"filter-by-progression"},{label:"Missable",id:"filter_missable",type:"radio",onChange:"ui.game.filter = 'missable'",checked:this.filter==="missable",name:"filter-by-missable"},{label:"Earned",id:"filter_earned",type:"radio",onChange:"ui.game.filter = 'earned'",checked:this.filter==="earned",name:"filter-by-earned"},{label:"Disable",id:"filter_all",type:"radio",onChange:"ui.game.filter = 'all'",checked:this.filter==="all",name:"filter-by-all"},{label:"Reverse filter",id:"filter_reverse-filter",type:"checkbox",onChange:"ui.game.filterReverse = this.checked",checked:this.filterReverse==!0,name:"filter-cheevos-reverse"}]});sortContext=()=>({label:"Sort by",elements:[{label:"Earned date",id:"sort_latest",type:"radio",onChange:"ui.game.sortType = 'date'; ",checked:this.sortType==="date",name:"sort-cheevos"},{label:"Points",id:"sort_points-count",type:"radio",onChange:"ui.game.sortType = 'points'",checked:this.sortType==="points",name:"sort-cheevos"},{label:"Retropoits",id:"sort_retropoints-count",type:"radio",onChange:"ui.game.sortType = 'truepoints'",checked:this.sortType==="truepoints",name:"sort-cheevos"},{label:"Rarity",id:"sort_rarity-count",type:"radio",onChange:"ui.game.sortType = 'earnedCount'",checked:this.sortType==="earnedCount",name:"sort-cheevos"},{label:"Default",id:"sort_default-count",type:"radio",onChange:"ui.game.sortType = 'default'",checked:this.sortType==="default",name:"sort-cheevos"},{label:"Reverse sort",id:"sort_reverse-sort",type:"checkbox",onChange:"ui.game.sortTypeReverse = this.checked",checked:this.sortTypeReverse==-1,name:"sort-cheevos-reverse"}]});cheevosListContext=()=>({label:"Show by",elements:[...Object.getOwnPropertyNames(this.listTypes).reduce((e,t)=>{let a={label:`${this.listTypes[t]}`,id:`game_list-type-${t}`,type:"radio",onChange:`ui.game.listType = '${t}'`,checked:this.listType==t,name:"game-list-type"};return e.push(a),e},[])]});get sortType(){return r.ui?.mobile?.game?.sortType??"title"}set sortType(e){r.ui.mobile.game.sortType=e,r.writeConfiguration(),this.updateCheevos()}get filter(){return r.ui?.mobile?.game?.filter??"all"}set filter(e){r.ui.mobile.game.filter=e,r.writeConfiguration(),this.updateCheevos()}get sortTypeReverse(){return r.ui?.mobile?.game?.sortTypeReverse??1}set sortTypeReverse(e){r.ui.mobile.game.sortTypeReverse=e?-1:1,r.writeConfiguration(),this.updateCheevos()}get filterReverse(){return r.ui?.mobile?.game?.filterReverse??!1}set filterReverse(e){r.ui.mobile.game.filterReverse=e,r.writeConfiguration(),this.updateCheevos()}get listType(){return r.ui?.mobile?.game.listType??"grid"}set listType(e){r.ui.mobile.game.listType=e,r.writeConfiguration(),this.update()}listTypes={list:"list",grid:"grid"};constructor(e){!r.ui.mobile.game&&(r.ui.mobile.game={}),this.gameID=e,this.update()}updateCheevos(){this.achievements=Object.values(u[this.gameID].Achievements),this.achievements=this.achievements.filter(t=>this.filterReverse^V[this.filter](t)),this.achievements=this.achievements.sort((t,a)=>this.sortTypeReverse*g[this.sortType](t,a));let e=document.querySelector(".game-achivs__container");e.innerHTML=this.AchievementsListHtml()}getSectionElement(){let e=document.createElement("div");return e.classList.add("game__section","section"),e.innerHTML=`
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
    `}update(e=this.gameID){if(ui.showLoader(),u[e]){this.gameData=u[this.gameID],this.achievements=Object.values(u[this.gameID].Achievements);let t=this.getSectionElement();ui.content.innerHTML="",ui.content.append(t),this.updateCheevos(),ui.removeLoader()}else h.getGameProgress({gameID:e}).then(t=>{u[e]=t}).then(()=>this.update())}};var K=["ID","Title","badges","ConsoleID","ImageIcon","NumAchievements","Points","retropoints","relisedAt","timeToBeat","timeToMaster","playersHardcore","timesBeaten","timesMastered","playersTotal","genres","series"];var ee="./json/games/all_min.json",te=s=>s.map(t=>{let a={};if(t.forEach((i,o)=>{a={...a,[K[o]]:i}}),a.timeToBeat){let i=Math.round(a.timeToBeat/60),o=i>=60?`${~~(i/60)}hr${i>119?"s":""}`:"",n=i%60>0?`${i%60}mins`:"",c=`${o} ${n}`;a.timeToBeatString=c}return a.Date=a.relisedAt?new Date(a.relisedAt).toLocaleDateString():"",a.trueRatio=+(a.retropoints/a.Points).toFixed(1),a.beatenRate=Number((100*a.timesBeaten/a.playersHardcore).toFixed(1))||0,a.masteryRate=Number((100*a.timesMastered/a.playersHardcore).toFixed(1))||0,a.ImageIcon=`/Images/${a.ImageIcon}.png`,a.badges??=[],a}),O=async(s=ee)=>{let t=await(await fetch(s)).json();return te(t)};function J(s){return v(`
        <div class="section__header-container">
            <div class="section__header-title">Library</div>
            <div class="section__control-container">
                <button class=" simple-button" onclick="generateContextMenu(ui.library.gamesSortContext(),event)">Sort</button>
                <button class="games-platform-filter simple-button" onclick="generateContextMenu(ui.library.gamesPlatformContext(),event)">${s.platformFilter??"Platform"} (${s.games.length})
                </button>
                <div class="hidden-text-input__container">
                    <input class="hidden-text-input__input" type="search">
                    <button class="hidden-text-input__button icon-button simple-button search-icon show-searchbar__button"
                    onclick="ui.library.showHiddenInput(this)"></button>
                </div>
            </div>
        </div>
    `)}function N(s){let{ID:e,ImageIcon:t,Title:a,badges:i,NumAchievements:o,Points:n,ConsoleID:c}=s,l=v(`
        <li class="library__game-item">
            <div class="library__game-container"  onclick="ui.showGameDetails(${e}); event.stopPropagation()">
                <div class="awards__game-preview-container" onclick="ui.goto.game(${e}); event.stopPropagation()">
                    <img class="awards__game-preview" src="${S(t)}">
                </div>
                <div class="awards__game-description">
                    <h2 class="library__game-title">${a} ${y(i)}</h2>
                    <div  class="game-stats__button"  onclick="ui.expandGameItem(${e},this); event.stopPropagation()">
                        <i class="game-stats__icon game-stats__expand-icon"/>
                    </div>
                    <div class="awards__game-stats__text">${f[c]}</div>

                    <div class="awards__game-stats-container" >
                        <div class="game-stats ">
                            <i class="game-stats__icon game-stats__achivs-icon"/>
                            <div class="game-stats__text">${o}</div>
                        </div>
                        <div class="game-stats game-stats__points">
                            <i class="game-stats__icon game-stats__points-icon"/>
                            <div class="game-stats__text">${n}</div>
                        </div>
                    </div>
                </div>
            </div>
        </li>
    `);return l.dataset.id=e,l}var R=class{gamesPlatformContext=()=>({label:"Filter by platform",elements:[{label:"All",id:"filter_all",type:"radio",onChange:"ui.library.platformFilter = 'all'",checked:this.platformFilterCode==="all",name:"filter-by-platform"},...Object.keys(f).reduce((e,t)=>{if(this.GAMES.some(a=>a.ConsoleID==t)){let a={label:`${f[t]}`,id:`filter_code-${t}`,type:"radio",onChange:`ui.library.platformFilter = ${t}`,checked:this.platformFilterCode==t,name:"filter-by-platform"};e.push(a)}return e},[])]});gamesSortContext=()=>({label:"Sort by",elements:[{label:"Title",id:"sort_title",type:"radio",onChange:"ui.library.sortType = 'title'; ",checked:this.sortType==="title",name:"sort-games"},{label:"Points",id:"sort_points-count",type:"radio",onChange:"ui.library.sortType = 'points'",checked:this.sortType==="points",name:"sort-games"},{label:"Achieves",id:"sort_achieves",type:"radio",onChange:"ui.library.sortType = 'achievementsCount'",checked:this.sortType==="achievementsCount",name:"sort-games"},{label:"Reverse sort",id:"sort_reverse-sort",type:"checkbox",onChange:"ui.library.sortTypeReverse = this.checked",checked:this.sortTypeReverse==-1,name:"sort-games-reverse"}]});get sortType(){return r.ui?.mobile?.library?.sortType??"title"}set sortType(e){r.ui.mobile.library.sortType=e,r.writeConfiguration(),this.updateGames()}get sortTypeReverse(){return r.ui?.mobile?.library?.sortTypeReverse??1}set sortTypeReverse(e){r.ui.mobile.library.sortTypeReverse=e?-1:1,r.writeConfiguration(),this.updateGames()}get platformFilter(){let e=r.ui?.mobile?.library?.platformFilter??"all";return e=="all"?"all":f[e]}get platformFilterCode(){return r.ui?.mobile?.library?.platformFilter??"all"}set platformFilter(e){r.ui.mobile.library.platformFilter=e,r.writeConfiguration(),this.updateGames(),document.querySelector(".games-platform-filter").innerText=`${this.platformFilter} (${this.games.length})`}titleFilter="";applyFilter(){if(this.games=this.platformFilterCode=="all"?this.GAMES:this.GAMES.filter(e=>e.ConsoleID==this.platformFilterCode),this.titleFilter){let e=new RegExp(this.titleFilter,"gi");this.games=this.games.filter(t=>t?.Title.match(e))}}applySort(){this.games=this.games.sort((e,t)=>this.sortTypeReverse*g[this.sortType](e,t))}constructor(){!r.ui.mobile.library&&(r.ui.mobile.library={}),this.update()}async update(){ui.showLoader(),await w(50),!this.GAMES&&await this.loadGamesArray(),this.applyFilter(),this.applySort();let e=this.LibrarySection();ui.content.innerHTML="",ui.content.append(e),ui.removeLoader(),b({list:this.gameList,items:this.games,callback:N})}updateGames(){this.applyFilter(),this.applySort(),this.gameList.innerHTML="",b({list:this.gameList,items:this.games,callback:N})}LibrarySection(){return this.librarySection=document.createElement("section"),this.librarySection.classList.add("library__section","section"),this.librarySection.appendChild(J(this)),this.gameList=document.createElement("ul"),this.gameList.classList.add("games-list"),this.librarySection.appendChild(this.gameList),this.librarySection}async loadGamesArray(){this.GAMES={},await this.getAllGames()}async getAllGames(){try{this.GAMES=await O("../../../json/games/all_min.json")}catch{return[]}}showHiddenInput(e){console.log("click");let t=e.closest(".hidden-text-input__container");t.classList.add("expanded-input");let a=t.querySelector("input");a.focus(),a.addEventListener("blur",i=>{a.value==""&&t.classList.remove("expanded-input")}),a.addEventListener("input",i=>{this.titleFilter=a.value,this.updateGames()})}};var P=class{constructor(){this.update()}async update(){d.showLoader(),await w(50),!this.FAVOURITES&&await this.loadGamesArray();let e=this.FavouritesSection();d.content.innerHTML="",d.content.append(e),d.removeLoader(),b({list:this.gameList,items:this.FAVOURITES,callback:this.getGameElement})}async loadGamesArray(){this.FAVOURITES=await h.getWantToPlayGamesList({}),console.log(this.FAVOURITES)}FavouritesSection(){return this.librarySection=document.createElement("section"),this.librarySection.classList.add("favourites__section","section"),this.librarySection.appendChild(this.headerElement()),this.gameList=document.createElement("ul"),this.gameList.classList.add("games-list"),this.librarySection.appendChild(this.gameList),this.librarySection}headerElement(){let e=document.createElement("div");return e.classList.add("section__header-container"),e.innerHTML=`
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
    `,e}getGameElement(e){let t=document.createElement("li");return t.classList.add("awards__game-item"),t.dataset.id=e?.ID,t.innerHTML=`    
            <li class="awards__game-item" data-id="${e?.ID}">
                <div class="awards__game-container"  onclick="ui.showGameDetails(${e?.ID}); event.stopPropagation()">
                    <div class="awards__game-preview-container" onclick="ui.goto.game(${e?.ID}); event.stopPropagation()">
                        <img class="awards__game-preview" src="${S(e?.ImageIcon)}" alt="">
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
                        <div class="game-stats__text">${e?.AchievementsPublished}</div>
                        </div>
                        <div class="game-stats game-stats__points">
                        <i class="game-stats__icon game-stats__points-icon"></i>
                        <div class="game-stats__text">${e?.PointsTotal}</div>
                        </div>
                        </div>
                    </div>
                </div>
        `,t}};var Y=()=>fetch("./sections/login.elem").then(e=>e.text()).then(e=>{let t=document.createElement("section");return t.className="login__section",t.innerHTML=e,t}).then(e=>(r.USER_NAME&&(e.querySelector("#login_user-name").value=r.USER_NAME),r.API_KEY&&(e.querySelector("#login__api-key").value=r.API_KEY),r.identConfirmed&&e.querySelector("#login__submit-button").classList.add("verified"),e));var X=()=>{let s=document.createElement("div");return s.classList.add("loading_screen"),s.innerHTML='<div class="loading_screen__loader-icon"></div>',s};var G=class{constructor(){this.update()}getSectionElement(){return v(`
            <div class="section unlocks__section">
                <div class="section__header-title">Recent Unlocks</div>
                <div class="section__control-container"></div>
                <ul class="game-achivs__container list"></ul>
            </div>
        `)}async update(){d.showLoader();let e=await h.getLastUnlocks({count:20}),t=this.getSectionElement(),a=e.map(i=>v(U(i)));t.querySelector("ul")?.append(...a),d.content.innerHTML="",d.content.append(t),d.removeLoader()}};var u={},H=class{get favouritesGames(){return r.ui?.mobile?.favouritesGames??{}}get isSoftmode(){return r.ui?.mobile?.isSoftMode??!1}set isSoftmode(e){r.ui.mobile.isSoftMode=e,r.writeConfiguration()}switchGameMode(){this.isSoftmode=!this.isSoftmode,this.home=new T}routes={"/":async()=>{r.identConfirmed?(this.home=new T,this.clearNavbar(),this.navbar.home.classList.add("checked")):this.goto.login()},"/login":async()=>{this.showLoader();let e=await Y();content.innerHTML="",content.append(e),this.clearNavbar(),this.navbar.login.classList.add("checked"),this.removeLoader()},"/home":async()=>{r.identConfirmed?(this.home=new T,this.clearNavbar(),this.navbar.home.classList.add("checked")):this.goto.login()},"/awards":async()=>{r.identConfirmed?(this.awards=new L,this.clearNavbar(),this.navbar.awards.classList.add("checked")):this.goto.login()},"/library":async()=>{r.identConfirmed?(this.library=new R,this.clearNavbar(),this.navbar.library.classList.add("checked")):this.goto.login()},"/favourites":async()=>{r.identConfirmed?(this.favourites=new P,this.clearNavbar(),this.navbar.favourites.classList.add("checked")):this.goto.login()},"/game":async e=>{if(r.identConfirmed){let t=e.gameID?parseInt(e.gameID,10):!1;t&&(this.game=new k(t))}else this.goto.login()},"/unlocks":async e=>{r.identConfirmed?this.unlocks=new G:this.goto.login()},"/test":async()=>{content.innerHTML="",content.append(await ae())}};goto={home:()=>{history.pushState(null,null,"#/home"),this.updatePage()},awards:()=>{history.pushState(null,null,"#/awards"),this.updatePage()},library:()=>{history.pushState(null,null,"#/library"),this.updatePage()},favourites:()=>{history.pushState(null,null,"#/favourites"),this.updatePage()},game:e=>{history.pushState(null,null,`#/game&gameID=${e}`),this.updatePage()},login:()=>{history.pushState(null,null,"#/login"),this.updatePage()},unlocks:()=>{history.pushState(null,null,"#/unlocks"),this.updatePage()}};constructor(){!r.ui?.mobile&&(r.ui.mobile={},r.writeConfiguration()),this.initializeElements(),this.addEvents()}initializeElements(){!r.ui.mobile&&(r.ui.mobile={}),this.sectionContainer=document.querySelector(".section-container"),this.app=document.getElementById("app"),this.content=document.getElementById("content"),this.navbar={container:document.querySelector(".navbar"),home:document.querySelector("#navbar_home"),awards:document.querySelector("#navbar_awards"),library:document.querySelector("#navbar_library"),favourites:document.querySelector("#navbar_favourites"),login:document.querySelector("#navbar_login")},r.identConfirmed&&this.navbar.login.classList.add("hidden")}addEvents(){window.addEventListener("hashchange",()=>{this.updatePage()}),window.addEventListener("DOMContentLoaded",()=>{window.dispatchEvent(new Event("hashchange"))}),app.addEventListener("click",()=>{this.removeContext(),this.removePopups()}),app.addEventListener("mousedown",()=>{this.removeContext()})}clearNavbar(){this.navbar.container.querySelectorAll(".checked").forEach(e=>e.classList.remove("checked"))}updatePage(){let e=window.location.hash.substring(1),[t,a]=e.split("&"),i=this.routes[t]||this.routes["/"],o=new URLSearchParams(a),n={};for(let[c,l]of o.entries())n[c]=l;i(n)}removePopups(){document.querySelectorAll(".popup").forEach(e=>e.remove())}removeContext(){document.querySelectorAll(".context").forEach(e=>{e.classList.add("hidden"),setTimeout(()=>e.remove(),1e3)})}async showGameDetails(e){this.removePopups(),this.showLoader();let t=document.createElement("div");t.addEventListener("touchend",o=>o.stopPropagation()),t.classList.add("popup-info__container","popup"),u[e]?(t.innerHTML=this.gamePopupHtml(u[e]),this.content.append(t),this.removeLoader()):h.getGameProgress({gameID:e}).then(o=>{u[e]=o,console.log(o),t.innerHTML=this.gamePopupHtml(o),this.content.append(t)}).then(()=>this.removeLoader());let a=u[e],i=this.gamePopupHtml(a);t.innerHTML=i,await w(500),document.querySelectorAll(".popup-info__image").forEach(o=>{o.addEventListener("click",n=>{n.stopPropagation();let c=document.createElement("div");c.classList.add("image-preview-popup"),c.innerHTML=`
          <img src="${o.src}" alt="">
        `,d.content.appendChild(c),c.addEventListener("click",l=>{l.stopPropagation(),c.remove()})})})}gamePopupHtml(e){return`
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
          href="https://google.com/search?q='${e?.FixedTitle}' '${f[e?.ConsoleID]}' ${ie}" target="_blank"></a>
      <a class="round-button icon-button redirect-icon simple-button game-popup__ra-button"
          href="https://retroachievements.org/game/${e?.ID}" target="_blank"></a>
      <button class="${d.favouritesGames[e?.ID]?"checked":""} round-button icon-button like-icon simple-button game-popup__like-button"
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
    `}async showAchivDetails(e,t){if(this.removePopups(),this.showLoader(),u[t]){let a=document.createElement("div");a.addEventListener("touchend",n=>n.stopPropagation()),a.classList.add("popup-info__container","popup");let i=u[t].Achievements[e],o=this.achivPopupHtml(i);a.innerHTML=o,this.content.append(a),this.removeLoader()}else{let a=await h.getGameProgress({gameID:t});u[t]=a,this.showAchivDetails(e,t)}}achivPopupHtml(e){return`
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
        ${e?.isEarned?`<div class="popup-info__property">Date earned : <span>${D(e?.DateEarned)}</span></div>`:""}
        ${e?.isHardcoreEarned?`<div class="popup-info__property">Date earned hardcore: <span>${D(e?.DateEarnedHardcore)}</span></div>`:""}
        <div class="popup-info__property">Date created : <span>${new Date(e?.DateCreated).toLocaleDateString()}</span></div>
        <div class="popup-info__property">Author : <span>${e?.Author}</span></div>
    </div>
  `}expandGameItem(e,t){let a=t.closest("li");a.classList.toggle("expanded");let i=o=>{this.showLoader();let n=v(`
        <div class="user-info__game-achivs-container">
            <ul class ="user-info__game-achivs-list"/>
        </div>
      `),c=n.querySelector("ul");a.appendChild(n),u[o]?(Object.values(u[o].Achievements).sort((l,m)=>g.date(l,m)).forEach(l=>{c.innerHTML+=this.achivHtml(l,o)}),this.removeLoader()):h.getGameProgress({gameID:o}).then(l=>{u[o]=l,Object.values(l.Achievements).sort((m,p)=>g.date(m,p)).forEach(m=>{c.innerHTML+=this.achivHtml(m,o)})}).then(()=>this.removeLoader())};a.querySelector(".user-info__game-achivs-container")??i(e)}achivHtmlList(e,t){return`    
            <li class="user-info__achiv-container"  onclick="ui.showAchivDetails(${e.ID},${t}); event.stopPropagation();">                
                <div class="user-info__achiv-preview-container">
                    <img class="user-info__achiv-preview ${(e.isHardcoreEarned||d.isSoftmode&&e.isEarned)&&"earned"}" src="${e.prevSrc}" alt="">
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
                    <img class="user-info__achiv-preview ${(e.isHardcoreEarned||d.isSoftmode&&e.isEarned)&&"earned"}" src="${e.prevSrc}" alt="">
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
        `}showLoader(){this.removeLoader(),this.app.append(X())}removeLoader(){document.querySelectorAll(".loading_screen").forEach(e=>e.remove())}},ae=()=>fetch("./sections/test.elem").then(e=>e.text()).then(e=>{let t=document.createElement("section");return t.className="test__section section",t.innerHTML=e,t});var ie="site:www.romhacking.net OR site:wowroms.com/en/roms OR site:cdromance.org OR site:coolrom.com.au/roms OR site:planetemu.net OR site:emulatorgames.net OR site:romsfun.com/roms OR site:emu-land.net/en";function Q(s,e){e.stopPropagation(),ui.removeContext();let t=document.createElement("div");t.classList.add("context-menu__container","context"),t.addEventListener("touchend",o=>o.stopPropagation()),t.addEventListener("mousedown",o=>o.stopPropagation()),t.innerHTML+=`
    <div class="context__header" onclick="ui.removeContext()">${s.label}</div>
  `;let a=()=>{let o=document.createElement("div");return o.classList.add("context__controls"),s.elements.forEach(n=>{switch(n.type){case"radio":o.innerHTML+=`
            <div class="context__radio">
              <input type="radio" onchange="${n.onChange}"
                    name="${n.name}" ${n.checked&&"checked"} id="${n.id}">
              <label class="context__radio-label" for="${n.id}">${n.label}</label>
            </div>
          `;break;case"checkbox":o.innerHTML+=`
            <div class="context__checkbox">
              <input type="checkbox" onchange="${n.onChange}"
                    name="${n.name}" ${n.checked&&"checked"} id="${n.id}">
              <label class="context__checkbox-label" for="${n.id}">${n.label}</label>
            </div>
          `;break;default:return""}}),o},i=document.createElement("div");i.classList.add("context__control-container"),i.append(a(s)),t.append(i),ui.app.appendChild(t)}var r=new E,h=new I,d=new H;window.ui=d;window.generateContextMenu=Q;window.submitRAData=()=>{let s=d.content.querySelector("#login_user-name").value,e=d.content.querySelector("#login__api-key").value;h.verifyUserIdent({userName:s,apiKey:e}).then(t=>{if(t.ID)se({userName:s,apiKey:e,userObj:t}),setTimeout(()=>{d.goto.home(),location.reload(!0)},1e3);else{r.identConfirmed=!1;let a=d.content.querySelector("#login__submit-button");a.classList.add("error"),a.classList.remove("verified")}})};function se({userName:s,apiKey:e,userObj:t}){r.USER_NAME=s,r.API_KEY=e,r.identConfirmed=!0,r.userImageSrc=`https://media.retroachievements.org${t?.UserPic}`;let a=d.content.querySelector("#login__submit-button");a.classList.remove("error"),a.classList.add("verified")}})();
