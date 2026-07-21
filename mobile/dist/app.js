(()=>{var _={date:(a,e)=>{let t=a.DateEarned?new Date(a.DateEarnedHardcore?a.DateEarnedHardcore:a.DateEarned):-1/0;return(e.DateEarned?new Date(e.DateEarnedHardcore?e.DateEarnedHardcore:e.DateEarned):-1/0)-t},earnedCount:(a,e)=>e.NumAwardedHardcore-a.NumAwardedHardcore,points:(a,e)=>parseInt(a.Points)-parseInt(e.Points),truepoints:(a,e)=>a.TrueRatio-e.TrueRatio,default:(a,e)=>a.DisplayOrder===0?_.id(a,e):a.DisplayOrder-e.DisplayOrder,id:(a,e)=>a.ID-e.ID,disable:(a,e)=>0,achievementsCount:(a,e)=>parseInt(a.NumAchievements)-parseInt(e.NumAchievements),title:(a,e)=>{let t=a.Title?.toUpperCase()??a.FixedTitle.toUpperCase(),i=e.Title?.toUpperCase()??e.FixedTitle.toUpperCase();return t<i?-1:t>i?1:0},award:(a,e)=>{let t={event:6,mastered:5,"beaten-hardcore":4,completed:3,"beaten-softcore":2,started:1},i=t[e.award]??0,s=t[a.award]??0,r=new Date(e.AwardedAt),o=new Date(a.AwardedAt);return i-s!=0?i-s:r-o}};var U=class{get _savedCompletionProgress(){return n._cfg?.apiWorker?.completionProgress??{}}get SAVED_COMPLETION_PROGRESS(){let e=this._savedCompletionProgress;return!e?.Total||n._cfg.apiWorker.targetUser!==n.targetUser?this.updateCompletionProgress({batchSize:500}).then(()=>this._savedCompletionProgress):this.updateCompletionProgress({batchSize:20,savedArray:e.Results}).then(()=>this._savedCompletionProgress)}set SAVED_COMPLETION_PROGRESS(e){e.Results=e.Results.map(t=>(delete t.ConsoleName,delete t.NumLeaderboards,t)),n._cfg.apiWorker||(n._cfg.apiWorker={}),n._cfg.apiWorker.targetUser=n.targetUser,n._cfg.apiWorker.completionProgress=e,n.writeConfiguration()}baseUrl="https://retroachievements.org/API/";endpoints={userProfile:"API_GetUserProfile.php",gameProgress:"API_GetGameInfoAndUserProgress.php",recentAchieves:"API_GetUserRecentAchievements.php",gameInfo:"API_GetGame.php",extendedGameInfo:"API_GetGameExtended.php",recentlyPlayedGames:"API_GetUserRecentlyPlayedGames.php",userAwards:"API_GetUserAwards.php",userGameRankAndScore:"API_GetUserGameRankAndScore.php",completionProgress:"API_GetUserCompletionProgress.php",gameList:"API_GetGameList.php",userSummary:"API_GetUserSummary.php",wantToPlay:"API_GetUserWantToPlayList.php"};async getLastUnlocks({apiKey:e,targetUser:t}){let i=new URL(this.endpoints.recentAchieves,this.baseUrl),s={y:e||n.API_KEY,u:t||n.targetUser,m:1440*31};return i.search=new URLSearchParams(s),(await fetch(i).then(d=>d.json()))?.map(d=>({...d,ID:d.AchievementID,DateEarned:d.Date})).sort((d,l)=>_.date(d,l))??[];return[{ID:383065,GameID:1891,GameTitle:"Puzznic",Title:"Enigma Explorer",Description:"Reach a score of 50,000 in Puzznic",Points:2,Type:null,BadgeName:"432937",IsAwarded:"1",DateAwarded:"2026-06-05 17:13:14",HardcoreAchieved:1},{ID:383073,GameID:1891,GameTitle:"Puzznic",Title:"Puzznic Level 1 - Riddle Ridge",Description:"In a single session, complete all of the Puzznic puzzles on level 1 [No continues]",Points:3,Type:"progression",BadgeName:"432901",IsAwarded:"1",DateAwarded:"2026-06-05 17:11:57",HardcoreAchieved:1}]}getUrl({endpoint:e,targetUser:t,gameID:i,minutes:s,apiKey:r,userName:o,achievesCount:d,count:l,offset:p}){let m=new URL(e,this.baseUrl),h={y:r||n.API_KEY,z:o||n.USER_NAME,u:t||n.targetUser,g:i||n.gameID,m:s||2e3,i:i||n.gameID,f:1,h:1,a:d||5,c:l||20,o:p||0};return m.search=new URLSearchParams(h),m}constructor(){}getUserCompelitionProgress({targetUser:e,count:t,offset:i}){let s=this.getUrl({targetUser:e||n.targetUser,count:t||100,offset:i||0,endpoint:this.endpoints.completionProgress});return fetch(s).then(r=>r.json()).then(r=>(r.Results=r.Results.map(o=>(o.ID=o.GameID,o.NumAchievements=o.MaxPossible,delete o.MaxPossible,delete o.NumLeaderboards,o)),r))}getUserAwards({targetUser:e}){let t=this.getUrl({targetUser:e||n.targetUser,endpoint:this.endpoints.userAwards});return fetch(t).then(i=>i.json()).then(i=>(i.VisibleUserAwards=i.VisibleUserAwards.map(s=>["Mastery/Completion","Game Beaten"].includes(s.AwardType)?(s.award=s.AwardType=="Game Beaten"?s.AwardDataExtra=="1"?"beaten":"beaten_softcore":s.AwardDataExtra=="1"?"mastered":"completed",s.DateEarned=s.AwardedAt,s.ConsoleName=="Events"&&(s.award="event"),s.timeString=this.toLocalTimeString(s.AwardedAt),s=this.fixGameTitle(s),s):null).filter(s=>s),i))}getGameProgress({targetUser:e,gameID:t}){let i=this.getUrl({endpoint:this.endpoints.gameProgress,targetUser:e||n.targetUser,gameID:t||n.gameID});return fetch(i).then(s=>s.json()).then(s=>{s={...s,TotalRealPlayers:0,TotalRetropoints:0,points_total:0,progressionRetroRatio:0,beatenCount:1/0,masteredCount:1/0,earnedStats:{soft:{count:0,points:0,retropoints:0},hard:{count:0,points:0,retropoints:0}}};let r={Count:0,WinCount:0,WinAwardedCount:0,WinEarnedCount:0},o={isBeaten:!0,isBeatenSoftcore:!0,isWinEarned:!1,isWinEarnedSoftcore:!1};for(let l of Object.values(s.Achievements))s.TotalRetropoints+=l.TrueRatio,s.points_total+=l.Points,s.TotalRealPlayers<l.NumAwarded&&(s.TotalRealPlayers=l.NumAwarded),l.DateEarned&&(s.earnedStats.soft.count+=1,s.earnedStats.soft.points+=l.Points,s.earnedStats.soft.retropoints+=l.TrueRatio),l.DateEarnedHardcore&&(s.earnedStats.hard.count+=1,s.earnedStats.hard.points+=l.Points,s.earnedStats.hard.retropoints+=l.TrueRatio),l.type==="progression"&&(r.Count++,l.DateEarned?l.DateEarnedHardcore||(o.isBeaten=!1):(o.isBeaten=!1,o.isBeatenSoftcore=!1),s.beatenCount>l.NumAwardedHardcore&&(s.beatenCount=l.NumAwardedHardcore)),l.type==="win_condition"&&(l.DateEarnedHardcore?(o.isWinEarned=!0,o.isWinEarnedSoftcore=!0):l.DateEarned&&(o.isWinEarnedSoftcore=!0),r.WinCount++,l.NumAwardedHardcore>r.WinAwardedCount&&(r.WinAwardedCount=l.NumAwardedHardcore),l.DateEarnedHardcore&&r.WinEarnedCount++),l.NumAwardedHardcore<s.masteredCount&&(s.masteredCount=l.NumAwardedHardcore);s.achievements_published==s.NumAwardedToUserHardcore?s.award="mastered":o.isBeaten&&(o.isWinEarned||r.WinCount==0)&&(s.award="beaten"),s={...s,winVariantCount:r.WinCount,winEarnedCount:r.WinEarnedCount,progressionSteps:r.WinCount>0?r.Count+1:r.Count},r.WinCount>0&&(s.beatenCount=r.WinAwardedCount),s.beatenCount!=1/0&&(s.beatenRate=~~(1e4*s.beatenCount/s.TotalRealPlayers)/100),s.masteredCount!=1/0&&(s.masteryRate=~~(1e4*s.masteredCount/s.TotalRealPlayers)/100);let d=~~(s.TotalRetropoints/s.points_total*100)/100;return s.retroRatio=d,s.gameDifficulty=d>9?"insane":d>7?"expert":d>5?"pro":d>3?"standard":"easy",Object.values(s.Achievements).map(l=>this.fixAchievement(l,s)),s=this.fixGameTitle(s),s})}getGameInfo({gameID:e,extended:t}){let i=this.getUrl({endpoint:this.endpoints[t?"extendedGameInfo":"gameInfo"],gameID:e});return fetch(i).then(s=>s.json())}getUserProfile({userName:e}){let t=this.getUrl({targetUser:e,userName:e,endpoint:this.endpoints.userProfile});return fetch(t).then(i=>i.json())}getUserSummary({targetUser:e,gamesCount:t=3,achievesCount:i}){let s=this.getUrl({targetUser:e,gameID:t,achievesCount:i,endpoint:this.endpoints.userSummary});return fetch(s).then(r=>r.json()).then(r=>(r.RecentlyPlayed=r.RecentlyPlayed.map(o=>(o.LastPlayed=this.toLocalTimeString(o.LastPlayed),r.Awarded[o.GameID]&&(o={...o,...r.Awarded[o.GameID]}),o=this.fixGameTitle(o),o)),r.RecentAchievements=Object.values(r.RecentAchievements).flatMap(o=>Object.values(o)).map(o=>(o.DateEarned=this.toLocalTimeString(o.DateAwarded),o)),r.isInGame=new Date-new Date(r.RecentlyPlayed[0].LastPlayed)<300*1e3,r))}verifyUserIdent({userName:e,apiKey:t}){let i=this.getUrl({targetUser:e,userName:e,apiKey:t,endpoint:this.endpoints.userProfile});return fetch(i).then(s=>s.json())}getGameList({userName:e,apiKey:t,systemID:i}){let s=this.getUrl({userName:e,apiKey:t,gameID:i,endpoint:this.endpoints.gameList});return fetch(s).then(r=>r.json())}doTestEndpoint({endpoint:e}){let t=this.getUrl({endpoint:e});return fetch(t).then(i=>i.json()).then(i=>console.log(i))}async updateCompletionProgress({savedArray:e=[],completionProgress:t=[],batchSize:i=500}){let s=await this.getUserCompelitionProgress({count:i,offset:t.length});t=[...t,...s.Results];let r=t.at(-1);if(e.findIndex(d=>d.hasOwnProperty("GameID")&&d.GameID===r.GameID&&d.MostRecentAwardedDate===r.MostRecentAwardedDate)>=0||t.length===s.Total){let d=t.map(l=>l.GameID);e=e.filter(l=>!d.includes(l.GameID)),e=[...t,...e],this.SAVED_COMPLETION_PROGRESS={Total:e.length,Results:e}}else setTimeout(()=>this.updateCompletionProgress({savedArray:e,completionProgress:t,batchSize:i}),100)}fixAchievement(e,t){let{BadgeName:i,DateEarned:s,DateEarnedHardcore:r,NumAwardedHardcore:o,NumAwarded:d,TrueRatio:l,ID:p}=e,{NumDistinctPlayers:m,NumAwardedToUserHardcore:h,TotalRealPlayers:T}=t,g=100*(o-h*.5)/((m+T)*.5-h*.5);t.Achievements[p]={...e,totalPlayers:m,isEarned:!!s,isHardcoreEarned:!!r,DateEarned:s&&this.toLocalTimeString(s),DateEarnedHardcore:r&&this.toLocalTimeString(r),prevSrc:`https://media.retroachievements.org/Badge/${i}.png`,rateEarned:~~(100*d/m)+"%",rateEarnedHardcore:~~(100*o/m)+"%",trend:g,difficulty:g<1.5&&l>300||l>=500?"hell":g<=3&&l>100||l>=300?"insane":g<8&&l>24?"expert":g<13&&l>10?"pro":g<20&&l>5||l>10?"standard":"easy"}}fixGameTitle(e){let t=[/\[SUBSET[^\[]*\]/gi,/~[^~]*~/g,".HACK//"],i=e.Title,s=t.reduce((r,o)=>{let d=new RegExp(o,"gi"),l=e.Title?.match(d);return l&&l.forEach(p=>{i=i.replace(p,"");let m=p;r.push(m.replace(/[~\.\[\]]|subset -|\/\//gi,""))}),r},[]);return e.badges=s,e.FixedTitle=i?.trim(),e}toLocalTimeString(e){!/(\+00\:00$)|(z$)/gi.test(e)&&(e+="+00:00");let i=new Date(e),s={day:"2-digit",month:"2-digit",year:"numeric",hour:"2-digit",minute:"2-digit",hour12:!1};return i}async getWantToPlayGamesList({apiKey:e,targetUser:t,count:i,offset:s}){let r=new URL(this.endpoints.wantToPlay,this.baseUrl),o={y:e||n.API_KEY,u:t||n.targetUser,o:s||0};return r.search=new URLSearchParams(o),(await fetch(r).then(l=>l.json())).Results||[]}};var J="retroApiConfig",H=class{get version(){return this._cfg.version??"0"}set version(e){this._cfg.version=e,this.writeConfiguration()}get API_KEY(){return this._cfg.identification.RAApi_key}set API_KEY(e){this._cfg.identification.RAApi_key=e,this.writeConfiguration()}get USER_NAME(){return this._cfg.identification.RAApi_login}set USER_NAME(e){this._cfg.identification.RAApi_login=e,this.writeConfiguration()}get identConfirmed(){return this._cfg.identification.identConfirmed??!1}set identConfirmed(e){this._cfg.identification.identConfirmed=e,this.writeConfiguration()}get userImageSrc(){return this._cfg.identification.userImageSrc||""}set userImageSrc(e){this._cfg.identification.userImageSrc=e,this.ui.buttons&&(ui.buttons.userImage.src=e),this.writeConfiguration()}get targetUser(){return this._cfg.settings.targetUser||this.USER_NAME}set targetUser(e){this._cfg.settings.targetUser=e,this.writeConfiguration(),this.identConfirmed&&(ui.settings.getLastGameID(),ui.awards.updateAwards())}get gameID(){return this._cfg.settings.gameID}set gameID(e){this._cfg.settings.gameID=e,this.writeConfiguration()}get ui(){return this._cfg.ui}constructor(){this.readConfiguration()}readConfiguration(){let e=JSON.parse(localStorage.getItem(J));e||(e={identification:{RAApi_key:"",RAApi_login:""},settings:{updateDelay:15,sort:"default",gameID:1},ui:{}}),this._cfg=e,localStorage.setItem(J,JSON.stringify(this._cfg)),this.writeConfiguration()}delayedWrite;writeConfiguration(){clearTimeout(this.delayedWrite),this.delayedWrite=setTimeout(()=>{localStorage.setItem(J,JSON.stringify(this._cfg))},1e3)}};function S(a){return a?.reduce((e,t)=>e+=`<i class="game-badge game-badge__${t.toLowerCase()}">${t}</i>`,"")}function I(a){return new Date(a).toLocaleString()}var u=a=>{/\/>/g.test(a)&&(a=a.replace(/<(\w+)([^>]*)\/>/g,(t,i,s)=>new Set(["area","base","br","col","embed","hr","img","input","link","meta","param","source","track","wbr"]).has(i.toLowerCase())?t:`<${i}${s}></${i}>`));let e=document.createElement("template");return e.innerHTML=a.trim(),e.content.firstElementChild};function ae(a){let e=+(a.retropoints/a.hardpoints).toFixed(2);return`
        <div class="section__header-container user-info__header-container">
            <div class="user-info__header">
                <div class="user-info__avatar-container">
                    <img class="user-info__avatar" src="${a.userImageSrc}" onclick="ui.goto.login()">
                </div>
                <button class="button__switch-mode ${c.isSoftmode?"softmode":""}" onclick="ui.switchGameMode()">${c.isSoftmode?"SOFT":"HARD"}</button>
                <div class="user-info__user-name-container">
                    <h1 class="user-info__user-name">${a.userName}</h1>
                    <div class="user-info__user-rank">${a.userRank}</div>
                    <div class="user-info__rich-presence">Member since: ${new Date(a.memberSince).toLocaleDateString()}</div>
                </div>
            </div>
            ${a.isInGame?`
            <div class="user-info__rich-presence"> ${a.richPresence}</div>
            `:""}
            
            
        </div>
    `}var N=({BadgeName:a})=>`https://media.retroachievements.org/Badge/${a}.png`,E=a=>`https://media.retroachievements.org${a}`;function Y(a,e){let{Title:t,Description:i,ID:s,GameID:r,HardcoreAchieved:o,HardcoreMode:d,IsAwarded:l,DateEarned:p,BadgeName:m,Points:h,DateEarnedHardcore:T}=a;e??={ID:r};let y=u(`
                    <div class="list-item achievement ${o||p?"unlocked":"locked"} ${T||d?"hardcore":""}">
                        <div class="item-icon">
                            <img class="item-img" src="${N({BadgeName:m})}"/>
                        </div>
                        <div class="item-meta">
                            <div class="item-name">${t}</div>
                            <div class="item-desc">${i}</div>
                            
                            <div class="game-stats__text cheevo-stats__unlocked">${ge(p)}</div>
                        </div>
                        <div class="item-points">${h}</div>
                    </div>
                `);return y.addEventListener("click",K=>{K.stopPropagation(),c.showAchivDetails(a.ID,e?.ID),console.log(a)}),y}function ie({lastAchievements:a}){return a.map(e=>Y(e))}var ge=a=>{let e=new Date(a);return e.toLocaleString()};function ve(a){let{GameID:e,ImageIcon:t,FixedTitle:i,badges:s,LastPlayed:r,ConsoleName:o,NumAchieved:d,NumAchievedHardcore:l,NumPossibleAchievements:p,ScoreAchieved:m,ScoreAchievedHardcore:h,PossibleScore:T}=a,g=u(`    
        <li class="list-game-item" data-id="${e}">
            <div class="list-item">
                <div class="user-info__game-preview-container">
                    <img class="user-info__game-preview" src="${E(t)}">
                </div>
                <div class="item-meta" >
                    <h2 class="user-info__game-title">${i} ${S(s)}</h2>
                    <div class="game-stats__text">${o}</div>
                    <div class="user-info_game-stats-container">
                        <div class="game-stats ">
                            <div class="game-stats__text cheevo-stats__unlocked">
                                ${I(r)}
                            </div>
                        </div>
                    </div><div  class="game-stats__button">
                        <i class="game-stats__icon game-stats__expand-icon"></i>
                    </div>
                </div>
            </div>
        </li>
    `);return g.addEventListener("click",y=>{y.stopPropagation(),c.showGameDetails(e)}),g.querySelector(".user-info__game-preview-container")?.addEventListener("click",y=>{y.stopPropagation(),c.goto.game(e)}),g.querySelector(".game-stats__button")?.addEventListener("click",y=>{y.stopPropagation(),c.expandGameItem(e,y.target)}),g}function se({lastGames:a}){return a.map(e=>ve(e))}var R,L=class{constructor(){this.update()}async update(){if(c.showLoader(),R){let e=this.HomeSection();c.content.innerHTML="",c.content.append(e),c.removeLoader()}else await this.loadUserInfo(),this.update()}async loadUserInfo(){let e=await v.getUserSummary({gamesCount:5,achievesCount:8});R={userName:e.User,status:e.Status?.toLowerCase(),richPresence:e.RichPresenceMsg,memberSince:e.MemberSince,userImageSrc:`https://media.retroachievements.org${e.UserPic}`,userRank:e.Rank?`Rank: ${e.Rank} (Top ${~~(1e4*e.Rank/e.TotalRanked)/100}%)`:"Rank is unavailable",softpoints:e.TotalSoftcorePoints,retropoints:e.TotalTruePoints,hardpoints:e.TotalPoints,lastGames:e.RecentlyPlayed,lastAchievements:Object.values(e.RecentAchievements).map(t=>(t.DateEarnedHardcore=t.DateAwarded,t)).sort((t,i)=>_.date(t,i)),isInGame:e.isInGame}}HomeSection(){let e=u(`
            <section class="home__section section">
                ${ae(R)}
                <div class="user-info__container">
                <ul class="list recent-cheevos-list">
                        <button id="see-more-cheevos" class="user-info__block-header">
                            <h2>Last Unlocks</h2>
                            <p>See more</p>
                        </button>
                    </ul>
                    <ul class="list recent-games-list">
                        <button  class="user-info__block-header">
                            <h2>Recently Played</h2>
                            <p style="display:none">See more</p>
                        </button>
                    </ul>
                </div>
            </section
        `);return e.querySelector(".recent-cheevos-list").append(...ie(R)),e.querySelector(".recent-games-list").append(...se(R)),e.querySelector("#see-more-cheevos")?.addEventListener("click",s=>{c.goto.unlocks()}),e}};var C=a=>new Promise(e=>setTimeout(e,a));function A({list:a,items:e,callback:t}){let i=document.createElement("div");i.classList.add("lazy-load_trigger"),a.appendChild(i);let s=0,r=40,o=m=>{for(let h=0;h<m&&s<e.length;h++)a.appendChild(t(e[s++]))};o(r);let d=(m,h)=>{m.forEach(T=>{T.isIntersecting&&(o(r),h.unobserve(i),s<e.length?(a.appendChild(i),h.observe(i)):i.remove())})},l={root:null,rootMargin:"0px",threshold:1};new IntersectionObserver(d,l).observe(i)}var w={1:"Genesis/Mega Drive",2:"Nintendo 64",3:"SNES/Super Famicom",4:"Game Boy",5:"Game Boy Advance",6:"Game Boy Color",7:"NES/Famicom",8:"PC Engine/TurboGrafx-16",9:"Sega CD",10:"32X",11:"Master System",12:"PlayStation",13:"Atari Lynx",14:"Neo Geo Pocket",15:"Game Gear",17:"Atari Jaguar",18:"Nintendo DS",19:"Nintendo Wii",21:"PlayStation 2",23:"Magnavox Odyssey 2",24:"Pokemon Mini",25:"Atari 2600",27:"Arcade",28:"Virtual Boy",29:"MSX",33:"SG-1000",37:"Amstrad CPC",38:"Apple II",39:"Saturn",40:"Dreamcast",41:"PlayStation Portable",43:"3DO Interactive Multiplayer",44:"ColecoVision",45:"Intellivision",46:"Vectrex",47:"PC-8000/8800",49:"PC-FX",51:"Atari 7800",53:"WonderSwan",56:"Neo Geo CD",57:"Fairchild Channel F",63:"Watara Supervision",69:"Mega Duck",71:"Arduboy",72:"WASM-4",73:"Arcadia 2001",74:"Interton VC 4000",75:"Elektor TV Games Computer",76:"PC Engine CD/TurboGrafx-CD",77:"Atari Jaguar CD",78:"Nintendo DSi",80:"Uzebox",101:"Events",102:"Standalone"};var $,F=class{awardTypeContext=()=>({label:"Filter by type",elements:[{label:`All (${$.VisibleUserAwards.length})`,id:"filter_all",type:"radio",onChange:"ui.awards.awardFilter = 'award'",checked:this.awardFilterName==="award",name:"filter-by-award"},...Object.getOwnPropertyNames(this.awardTypes).reduce((e,t)=>{let i={label:`${this.awardTypes[t].name} (${this.awardTypes[t].count})`,id:`filter_code-${t}`,type:"radio",onChange:`ui.awards.awardFilter = '${t}'`,checked:this.awardFilterName==t,name:"filter-by-award"};return e.push(i),e},[])]});awardPlatformContext=()=>({label:"Filter by platform",elements:[{label:`All (${$.VisibleUserAwards.length})`,id:"filter_all",type:"radio",onChange:"ui.awards.platformFilterCode = 'platform'",checked:this.platformFilterName==="platform",name:"filter-by-platform"},...Object.getOwnPropertyNames(this.platformCodes).reduce((e,t)=>{let i={label:`${this.platformCodes[t].name} (${this.platformCodes[t].count})`,id:`filter_code-${t}`,type:"radio",onChange:`ui.awards.platformFilterCode = ${t}`,checked:this.platformFilterCode==t,name:"filter-by-platform"};return e.push(i),e},[])]});awardSortContext=()=>({label:"Sort by",elements:[{label:"Date earned",id:"sort_date-earned",type:"radio",onChange:"ui.awards.awardSortType = 'date'",checked:this.awardSortType==="date",name:"sort-awards"},{label:"Type",id:"sort_award-type",type:"radio",onChange:"ui.awards.awardSortType = 'award'",checked:this.awardSortType==="award",name:"sort-awards"},{label:"Title",id:"sort_title",type:"radio",onChange:"ui.awards.awardSortType = 'title'",checked:this.awardSortType==="title",name:"sort-awards"},{label:"Reverse sort",id:"sort_reverse-sort",type:"checkbox",onChange:"ui.awards.awardSortTypeReverse = this.checked",checked:this.awardSortTypeReverse==-1,name:"sort-awards-reverse"}]});awardListContext=()=>({label:"Show by",elements:[...Object.getOwnPropertyNames(this.listTypes).reduce((e,t)=>{let i={label:`${this.listTypes[t]}`,id:`awards_list-type-${t}`,type:"radio",onChange:`ui.awards.listType = '${t}'`,checked:this.listType==t,name:"awards-list-type"};return e.push(i),e},[])]});get listType(){return n.ui?.mobile?.listType??"list"}set listType(e){n.ui.mobile.listType=e,n.writeConfiguration(),this.update()}get awardFilter(){let e=n.ui?.mobile?.awardsTypeFilter??"award";return this.awardTypesNames[e]}get awardFilterName(){return n.ui?.mobile?.awardsTypeFilter??"award"}set awardFilter(e){n.ui.mobile.awardsTypeFilter=e,n.writeConfiguration(),this.update()}get platformFilterName(){let e=n.ui?.mobile?.platformFilter??"platform";return e=="platform"?"platform":w[e]}get platformFilterCode(){return n.ui?.mobile?.platformFilter??"platform"}set platformFilterCode(e){n.ui.mobile.platformFilter=e,n.writeConfiguration(),this.update()}get awardSortType(){return n.ui?.mobile?.awardSortType??"date"}set awardSortType(e){n.ui.mobile.awardSortType=e,n.writeConfiguration(),this.update()}get awardSortTypeReverse(){return n.ui?.mobile?.awardSortTypeReverse??"1"}set awardSortTypeReverse(e){n.ui.mobile.awardSortTypeReverse=e?-1:1,n.writeConfiguration(),this.update()}applySort(){this.awardedGames=this.awardedGames.sort((e,t)=>this.awardSortTypeReverse*_[this.awardSortType](e,t))}applyFilter(){this.awardedGames=$.VisibleUserAwards,this.awardFilterName!=="award"&&(this.awardedGames=this.awardedGames.filter(e=>e.award==this.awardFilterName)),this.platformFilterCode!=="platform"&&(this.awardedGames=this.awardedGames.filter(e=>e.ConsoleID==this.platformFilterCode))}listTypes={list:"list",grid:"grid"};awardTypesNames={beaten:"Beaten",beaten_softcore:"Beaten Softcore",completed:"Completed",mastered:"Mastered",event:"Event",award:"Award Type"};sortMethods={latest:"date",title:"title"};awardedGames=[];constructor(){!n.ui.mobile.awards&&(n.ui.mobile.awards={}),ui.showLoader(),this.downloadAwardsData().then(()=>{this.getAwardsStats(),this.update()})}async update(){ui.showLoader(),await C(50),this.applyFilter(),this.applySort();let e=this.AwardsSection();ui.content.innerHTML="",ui.content.append(e),ui.removeLoader();let t=e.querySelector(".user-info__awards-list");A({list:t,items:this.awardedGames,callback:this.getGameElement})}getAwardsStats(){let e=$.VisibleUserAwards.reduce((t,i)=>(!t.platforms[i.ConsoleID]&&(t.platforms[i.ConsoleID]={count:0}),t.platforms[i.ConsoleID].name=i.ConsoleName,t.platforms[i.ConsoleID].count++,!t.awards[i.award]&&(t.awards[i.award]={count:0}),t.awards[i.award].name=this.awardTypesNames[i.award],t.awards[i.award].count++,t),{platforms:{},awards:{}});this.platformCodes=e.platforms,this.awardTypes=e.awards}async downloadAwardsData(){!$&&($=await v.getUserAwards({}))}AwardsSection(){let e=document.createElement("section");return e.classList.add("awards__section","section"),e.innerHTML=`
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
                ${e.FixedTitle} ${S(e.badges)}
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
  `,t}};var x=Object.freeze({PROGRESSION:"progression",MISSABLE:"missable",WIN:"win_condition"});var k={earned:({DateEarnedHardcore:a})=>a,earnedSoftcore:({DateEarned:a,DateEarnedHardcore:e})=>!e&&a,notEarned:({DateEarnedHardcore:a,DateEarned:e})=>!a&&!e,missable:({Type:a})=>a===x.MISSABLE,progression:({Type:a})=>a===x.PROGRESSION||a===x.WIN,typeless:a=>!k.progression(a)&&!k.missable(a),all:()=>!0,genre:({genres:a,genre:e})=>a?.includes(e),level:({level:a},{targetLevel:e})=>parseInt(a)===parseInt(e),group:({group:a,targetGroup:e})=>a===e,leveless:({level:a})=>!a,setID:({setID:a},{targetSet:e})=>a==e,disabled:()=>!0},re=Object.freeze({UNLOCKED:"earned",UNLOCKED_SOFT:"earnedSoftcore",MISSABLE:"missable",PROGRESSION:"progression"});function fe(a){return new Date(a)}var P=Object.freeze({TIME_TO_UNLOCK:"timeToUnlock",UNLOCK_DATE:"latest",TRUE_RATIO:"trueRatio",UNLOCK_RATE:"unlockRate",POINTS:"points",TRUE_POINTS:"truepoints",UNLOCK_DATE_RA:"raLatest",DEFAULT:"default",LEVEL:"level",CUSTOM_ORDER:"customOrder"}),b={latestHardcore:(a,e,t=1,i=!1)=>b.latest(a,e,t,i,!0),latest:(a,e,t=1,i=!1,s=!1)=>{let r=B(a),o=B(e);if(i){let d=!r,l=!o;if(d&&!l)return 1;if(!d&&l)return-1}return(o-r)*t},raLatest:(a,e,t=1,i)=>{let s=B(a),r=B(e);return s*r===0&&s-r!==0?r?t:-1*t:b.default(a,e)},earnedCount:(a,e,t=1)=>(e.NumAwardedHardcore-a.NumAwardedHardcore)*t,unlockRate:(a,e,t=1)=>b.earnedCount(a,e,t),rarest:(a,e,t=1)=>b.earnedCount(a,e,t),points:(a,e,t=1)=>(a.Points-e.Points)*t,truepoints:(a,e,t=1)=>(a.TrueRatio-e.TrueRatio)*t,trueRatio:(a,e,t=1)=>{let i=a.TrueRatio/a.Points,s=e.TrueRatio/e.Points;return(i-s)*t},default:(a,e,t=1)=>a.DisplayOrder!=0?(a.DisplayOrder-e.DisplayOrder)*t:b.id(a,e,t),customOrder:(a,e)=>a.customOrder-e.customOrder,progression:(a,e)=>{if(a.DisplayOrder===e.DisplayOrder)return b.unlockRate(a,e);let t=({DisplayOrder:r,Type:o})=>o===x.PROGRESSION?r:r*1e3,i=t(a),s=t(e);return i-s},id:(a,e,t=1)=>(a.ID-e.ID)*t,disable:(a,e)=>0,level:(a,e,t,i=!1)=>i&&(!a.level||!e.level)&&!(!a.level&&!e.level)?e.level?1:-1:!a.level&&!e.level?i?0:b.default(a,e,t):a.level?e.level?(a.level-e.level)*t:-1*t:1*t,timeToUnlock:(a,e,t,i=!1)=>i&&(!a.timeToUnlock||!e.timeToUnlock)&&!(!a.timeToUnlock&&!e.timeToUnlock)?e.timeToUnlock?1:-1:!a.timeToUnlock&&!e.timeToUnlock?i?0:b.difficulty(a,e,t):a.timeToUnlock?e.timeToUnlock?(a.timeToUnlock-e.timeToUnlock)*t:-1*t:1*t,difficulty:(a,e,t)=>{let i=a.difficulty-e.difficulty;return i==0&&(i=e.NumAwardedHardcore-a.NumAwardedHardcore),i*t}},B=(a,e=!1)=>{let t=a.DateEarnedHardcore||!e&&a.DateEarned;return t?fe(t):0};function oe(a,e=!1){if(!a)return"-";if(a=Number(a),e)return a>=3600?`${Math.round(a/3600)}h`:a>=60?`${Math.round(a/60)}min`:`${Math.round(a)}s`;let t=Math.floor(a/3600),i=Math.floor(a%3600/60),s=Math.floor(a%60);return t?`${t}h ${i}m`:i?`${i} min${i>1?"s":""}`:`${s} secs`}function M(a,e){e.stopPropagation(),ui.removeContext();let t=document.createElement("div");t.classList.add("context-menu__container","context"),t.addEventListener("touchend",r=>r.stopPropagation()),t.addEventListener("mousedown",r=>r.stopPropagation()),t.innerHTML+=`
    <div class="context__header" onclick="ui.removeContext()">${a.label}</div>
  `;let i=()=>{let r=document.createElement("div");return r.classList.add("context__controls"),a.elements.forEach(o=>{switch(o.type){case"radio":r.innerHTML+=`
            <div class="context__radio">
              <input type="radio" onchange="${o.onChange}"
                    name="${o.name}" ${o.checked&&"checked"} id="${o.id}">
              <label class="context__radio-label" for="${o.id}">${o.label}</label>
            </div>
          `;break;case"checkbox":r.innerHTML+=`
            <div class="context__checkbox">
              <input type="checkbox" onchange="${o.onChange}"
                    name="${o.name}" ${o.checked&&"checked"} id="${o.id}">
              <label class="context__checkbox-label" for="${o.id}">${o.label}</label>
            </div>
          `;break;default:return""}}),r},s=document.createElement("div");s.classList.add("context__control-container"),s.append(i(a)),t.append(s),ui.app.appendChild(t)}var O=class{filterContext=()=>({label:"Filter by",elements:[...Object.values(re).map(e=>({label:e,id:`filter_${e}`,type:"radio",onChange:`ui.game.filter = '${e}'`,checked:this.filter===e,name:`filter-by-${e}`})),{label:"disabled",id:"filter_disabled",type:"radio",onChange:"ui.game.filter = 'disabled'",checked:this.filter==="disabled",name:"filter-by-disabled"},{label:"Reverse filter",id:"filter_reverse-filter",type:"checkbox",onChange:"ui.game.filterReverse = this.checked",checked:this.filterReverse==!0,name:"filter-cheevos-reverse"}]});sortContext=()=>({label:"Sort by",elements:[...Object.values(P).filter(e=>![P.CUSTOM_ORDER,P.TIME_TO_UNLOCK].includes(e)).map(e=>({label:e,id:`context-${e}`,type:"radio",onChange:`ui.game.sortType = '${e}'; `,checked:this.sortType===e,name:"sort-cheevos"})),{label:"Reverse sort",id:"sort_reverse-sort",type:"checkbox",onChange:"ui.game.sortTypeReverse = this.checked",checked:this.sortTypeReverse==-1,name:"sort-cheevos-reverse"}]});cheevosListContext=()=>({label:"Show by",elements:[...Object.getOwnPropertyNames(this.listTypes).reduce((e,t)=>{let i={label:`${this.listTypes[t]}`,id:`game_list-type-${t}`,type:"radio",onChange:`ui.game.listType = '${t}'`,checked:this.listType==t,name:"game-list-type"};return e.push(i),e},[])]});get sortType(){return n.ui?.mobile?.game?.sortType??P.DEFAULT}set sortType(e){n.ui.mobile.game.sortType=e,n.writeConfiguration(),this.updateCheevos()}get filter(){return n.ui?.mobile?.game?.filter??"disabled"}set filter(e){n.ui.mobile.game.filter=e,n.writeConfiguration(),this.updateCheevos()}get sortTypeReverse(){return n.ui?.mobile?.game?.sortTypeReverse??1}set sortTypeReverse(e){n.ui.mobile.game.sortTypeReverse=e?-1:1,n.writeConfiguration(),this.updateCheevos()}get filterReverse(){return n.ui?.mobile?.game?.filterReverse??!1}set filterReverse(e){n.ui.mobile.game.filterReverse=e,n.writeConfiguration(),this.updateCheevos()}get listType(){return n.ui?.mobile?.game.listType??"grid"}set listType(e){n.ui.mobile.game.listType=e,n.writeConfiguration(),this.update()}listTypes={list:"list",grid:"grid"};constructor(e){!n.ui.mobile.game&&(n.ui.mobile.game={}),this.gameID=e,this.update()}updateCheevos(){this.achievements=Object.values(f[this.gameID]?.Achievements??{}),this.filter==="disabled"?this.achievements=this.achievements.filter(e=>!0):this.achievements=this.achievements.filter(e=>this.filterReverse?!k[this.filter]?.(e):k[this.filter]?.(e)),this.achievements=this.achievements.sort((e,t)=>this.sortTypeReverse*b[this.sortType]?.(e,t)),this.updateGameSection()}getSectionElement(){let e=document.createElement("div");return e.classList.add("game__section","section"),e.innerHTML=`
            ${this.SectionHeaderHtml()}
            <ul class="game-achivs__container ${this.listType}"></ul>
        `,e}AchievementHtml(e){let t=~~(1e3*e.NumAwardedHardcore/this.gameData.NumDistinctPlayers)/10;return`
            <li class="achiv__achiv-container ${e.isHardcoreEarned?"hardcore":""}" onclick="ui.showAchivDetails(${e.ID}, ${this.gameID}); event.stopPropagation()">
                <div class="achiv__title-container">
                    <div class="achiv__preview-container">
                        <img class="user-info__achiv-preview ${e.isHardcoreEarned||c.isSoftmode&&e.isEarned?"earned":""}"
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
        `}SectionHeaderHtml(){let e=c.isSoftmode?{count:this.gameData.earnedStats.soft.count,points:this.gameData.earnedStats.soft.points,retropoints:this.gameData.earnedStats.hard.retropoints}:{count:this.gameData.earnedStats.hard.count,points:this.gameData.earnedStats.hard.points,retropoints:this.gameData.earnedStats.hard.retropoints},t=~~(100*e.count/this.gameData.NumAchievements);return`
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
                     ${this.gameData.FixedTitle} ${S(this.gameData.badges)}                       
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
    `}update(e=this.gameID){if(c.showLoader(),f[e]){this.gameData=f[this.gameID],this.achievements=Object.values(f[this.gameID].Achievements);let t=this.generateGameSection(this.gameData);c.content.innerHTML="",c.content.append(t),this.updateCheevos(this.gameData),c.removeLoader()}else v.getGameProgress({gameID:e}).then(t=>{f[e]=t}).then(()=>this.update())}updateGameSection(e){e??=this.gameData;let t=r=>{let{ImageIcon:o,Title:d,ConsoleName:l,Developer:p,UserTotalPlaytime:m,TotalPoints:h}=r;document.querySelector(".game-image").src=E(o),document.querySelector(".game-title").innerHTML=d,document.querySelector(".game-meta>.platform").innerHTML=l,document.querySelector(".game-meta>.game-dev").innerHTML=p,document.querySelector(".playtime").innerHTML="Time played: "+oe(m,!1)},i=r=>{let{NumAchievements:o,NumAwardedToUserHardcore:d,points_total:l}=r,p=r.earnedStats?.hard?.points??0,m=Math.floor(100*d/o);document.querySelector(".progress-card").style.setProperty("--unlock-rate",`${m}%`),document.querySelector(".progress-card .progress-count").innerHTML=`${d} / ${o}`,document.querySelector(".progress-footer .points").innerHTML=`${p} / ${l} points`,document.querySelector(".progress-card .progress-footer>span").innerHTML=`${m}% completed`},s=r=>{function o(p,m){let{Title:h,Description:T,Points:g,TrueRatio:y,BadgeName:K,DateEarnedHardcore:Z,DateEarned:j,NumAwardedHardcore:Ce,rateEarnedHardcore:pe}=p,ee=Z||j,ue=Math.round(100*y/g)/100,te=u(`
                    <div class="list-item achievement ${j?"unlocked":"locked"} ${Z?"hardcore":""}">
                        <div class="item-icon">
                            <img class="item-img" src="${N({BadgeName:K})}"/>
                        </div>
                        <div class="item-meta">
                            <div class="item-name">${h}</div>
                            <div class="item-desc">${T}</div>
                            <div class="item-icons-row">
                                <span>${g}pts.</span>
                                <span class="badge badge_solid-black">\u2A2F${ue}</span>
                                <span>\u25D4 ${pe}</span>
                                <span>${ee?new Date(ee).toLocaleString():""}</span>
                            </div>
                        </div>
                        <!--<div class="item-points">${g}</div>-->
                    </div>
                `);return te.addEventListener("click",he=>{he.stopPropagation(),c.showAchivDetails(p.ID,m.ID),console.log(m)}),te}let d=()=>{document.querySelector("#sort-name").innerHTML=this.sortType,document.querySelector("#filter-name").innerHTML=this.filter},l=document.querySelector(".achievement-list");l.innerHTML="",this.achievements.forEach(p=>{let m=o(p,r);l.append(m)}),d()};t(e),i(e),s(e)}generateGameSection(e){let t=()=>{let o=u(`
                <div class="current-game">
                    <div class="game-icon">
                        <img class="game-image" />
                    </div>
                    <div class="game-info">
                        <div class="game-title"></div>
                        <div class="game-meta">
                            <span class="platform"></span>
                            <span class="game-dev"></span>
                        </div>
                        <div class="playtime"></div>
                    </div>
                </div>
            `);return o.addEventListener("click",d=>{d.stopPropagation(),c.showGameDetails(e.ID)}),o},i=()=>u(`
            <div class="progress-card">
                <div class="progress-header">
                    <span class="progress-label">Completion progress</span>
                    <span class="progress-count"></span>
                </div>
                <div class="progress-bar">
                    <div class="progress-bar-fill"></div>
                </div>
                <div class="progress-footer">
                    <span></span>
                    <span class="points"></span>
                </div>
            </div>
        `),s=()=>{let o=u(`
                <div class="achievements-section">
                    <div class="section-title">Achievements</div>
                    <div class="toolbar">
                        <button id="sort-ach-button" class="btn btn-exp">Sort By: <span id="sort-name"></span></button>
                        <button id="filter-ach-button" class="btn btn-exp">Filter By: <span id="filter-name"></span></button>
                        <!--<select>
                            <option>Default</option>
                            <option>Unlock Rate</option>
                            <option>Points</option>
                            <option>Unlocked First</option>
                        </select>
                        <div class="filter-group">
                            <button class="btn active">All</button>
                            <button class="btn">Unlocked</button>
                            <button class="btn">Missable</button>
                            <button class="btn">Progression</button>
                        </div>-->
                    </div>
                    <div class="achievement-list"></div>
                </div>
            `);return o.querySelector("#sort-ach-button").addEventListener("click",d=>{M(this.sortContext(),d)}),o.querySelector("#filter-ach-button").addEventListener("click",d=>{M(this.filterContext(),d)}),o},r=u(`
            <div class="game-content content"></div>
        `);return r.append(t(),i(),s()),r}};var ne=["ID","Title","badges","ConsoleID","ImageIcon","NumAchievements","Points","retropoints","relisedAt","timeToBeat","timeToMaster","playersHardcore","timesBeaten","timesMastered","playersTotal","genres","series","updated"];var _e="./json/games/all_min.json",ye=a=>a.map(t=>{let i={};if(t.forEach((s,r)=>{i={...i,[ne[r]]:s}}),i.timeToBeat){let s=Math.round(i.timeToBeat/60),r=s>=60?`${~~(s/60)}hr${s>119?"s":""}`:"",o=s%60>0?`${s%60}mins`:"",d=`${r} ${o}`;i.timeToBeatString=d}return i.Date=i.relisedAt?new Date(i.relisedAt).toLocaleDateString():"",i.ModifiedDate=i.updated?new Date(i.updated).toLocaleDateString():"",i.trueRatio=+(i.retropoints/i.Points).toFixed(1),i.beatenRate=Number((100*i.timesBeaten/i.playersHardcore).toFixed(1))||0,i.masteryRate=Number((100*i.timesMastered/i.playersHardcore).toFixed(1))||0,i.ImageIcon=`/Images/${i.ImageIcon}.png`,i.badges??=[],i}),le=async(a=_e)=>{let t=await(await fetch(a)).json();return ye(t)};function de(a){return u(`
        <div class="section__header-container">
            <div class="section__header-title">Library</div>
            <div class="section__control-container">
                <button class=" simple-button" onclick="generateContextMenu(ui.library.gamesSortContext(),event)">Sort</button>
                <button class="games-platform-filter simple-button" onclick="generateContextMenu(ui.library.gamesPlatformContext(),event)">${a.platformFilter??"Platform"} (${a.games.length})
                </button>
                <div class="hidden-text-input__container">
                    <input class="hidden-text-input__input" type="search">
                    <button class="hidden-text-input__button icon-button simple-button search-icon show-searchbar__button"
                    onclick="ui.library.showHiddenInput(this)"></button>
                </div>
            </div>
        </div>
    `)}function G(a){let{ID:e,ImageIcon:t,Title:i,badges:s,NumAchievements:r,Points:o,ConsoleID:d}=a,l=u(`
        <li class="list-game-item">
            <div class="library__game-container list-item"  onclick="ui.showGameDetails(${e}); event.stopPropagation()">
                <div class="awards__game-preview-container" onclick="ui.goto.game(${e}); event.stopPropagation()">
                    <img class="awards__game-preview" src="${E(t)}">
                </div>
                <div class="awards__game-description">
                    <h2 class="library__game-title">${i} ${S(s)}</h2>
                    <div  class="game-stats__button"  onclick="ui.expandGameItem(${e},this); event.stopPropagation()">
                        <i class="game-stats__icon game-stats__expand-icon"/>
                    </div>
                    <div class="awards__game-stats__text">${w[d]}</div>

                    <div class="awards__game-stats-container" >
                        <div class="game-stats ">
                            <i class="game-stats__icon game-stats__achivs-icon"/>
                            <div class="game-stats__text">${r}</div>
                        </div>
                        <div class="game-stats game-stats__points">
                            <i class="game-stats__icon game-stats__points-icon"/>
                            <div class="game-stats__text">${o}</div>
                        </div>
                    </div>
                </div>
            </div>
        </li>
    `);return l.dataset.id=e,l}var W=class{gamesPlatformContext=()=>({label:"Filter by platform",elements:[{label:"All",id:"filter_all",type:"radio",onChange:"ui.library.platformFilter = 'all'",checked:this.platformFilterCode==="all",name:"filter-by-platform"},...Object.keys(w).reduce((e,t)=>{if(this.GAMES.some(i=>i.ConsoleID==t)){let i={label:`${w[t]}`,id:`filter_code-${t}`,type:"radio",onChange:`ui.library.platformFilter = ${t}`,checked:this.platformFilterCode==t,name:"filter-by-platform"};e.push(i)}return e},[])]});gamesSortContext=()=>({label:"Sort by",elements:[{label:"Title",id:"sort_title",type:"radio",onChange:"ui.library.sortType = 'title'; ",checked:this.sortType==="title",name:"sort-games"},{label:"Points",id:"sort_points-count",type:"radio",onChange:"ui.library.sortType = 'points'",checked:this.sortType==="points",name:"sort-games"},{label:"Achieves",id:"sort_achieves",type:"radio",onChange:"ui.library.sortType = 'achievementsCount'",checked:this.sortType==="achievementsCount",name:"sort-games"},{label:"Reverse sort",id:"sort_reverse-sort",type:"checkbox",onChange:"ui.library.sortTypeReverse = this.checked",checked:this.sortTypeReverse==-1,name:"sort-games-reverse"}]});get sortType(){return n.ui?.mobile?.library?.sortType??"title"}set sortType(e){n.ui.mobile.library.sortType=e,n.writeConfiguration(),this.updateGames()}get sortTypeReverse(){return n.ui?.mobile?.library?.sortTypeReverse??1}set sortTypeReverse(e){n.ui.mobile.library.sortTypeReverse=e?-1:1,n.writeConfiguration(),this.updateGames()}get platformFilter(){let e=n.ui?.mobile?.library?.platformFilter??"all";return e=="all"?"all":w[e]}get platformFilterCode(){return n.ui?.mobile?.library?.platformFilter??"all"}set platformFilter(e){n.ui.mobile.library.platformFilter=e,n.writeConfiguration(),this.updateGames(),document.querySelector(".games-platform-filter").innerText=`${this.platformFilter} (${this.games.length})`}titleFilter="";applyFilter(){if(this.games=this.platformFilterCode=="all"?this.GAMES:this.GAMES.filter(e=>e.ConsoleID==this.platformFilterCode),this.titleFilter){let e=new RegExp(this.titleFilter,"gi");this.games=this.games.filter(t=>t?.Title.match(e))}}applySort(){this.games=this.games.sort((e,t)=>this.sortTypeReverse*_[this.sortType](e,t))}constructor(){!n.ui.mobile.library&&(n.ui.mobile.library={}),this.update()}async update(){ui.showLoader(),await C(50),!this.GAMES&&await this.loadGamesArray(),this.applyFilter(),this.applySort();let e=this.LibrarySection();ui.content.innerHTML="",ui.content.append(e),ui.removeLoader(),A({list:this.gameList,items:this.games,callback:G})}updateGames(){this.applyFilter(),this.applySort(),this.gameList.innerHTML="",A({list:this.gameList,items:this.games,callback:G})}LibrarySection(){return this.librarySection=document.createElement("section"),this.librarySection.classList.add("library__section","section"),this.librarySection.appendChild(de(this)),this.gameList=document.createElement("ul"),this.gameList.classList.add("games-list"),this.librarySection.appendChild(this.gameList),this.librarySection}async loadGamesArray(){this.GAMES={},await this.getAllGames()}async getAllGames(){try{this.GAMES=await le("../json/games/all_min.json")}catch{return[]}}showHiddenInput(e){console.log("click");let t=e.closest(".hidden-text-input__container");t.classList.add("expanded-input");let i=t.querySelector("input");i.focus(),i.addEventListener("blur",s=>{i.value==""&&t.classList.remove("expanded-input")}),i.addEventListener("input",s=>{this.titleFilter=i.value,this.updateGames()})}};var q=class{constructor(){this.update()}async update(){c.showLoader(),await C(50),!this.FAVOURITES&&await this.loadGamesArray();let e=this.FavouritesSection();c.content.innerHTML="",c.content.append(e),c.removeLoader(),A({list:this.gameList,items:this.FAVOURITES,callback:this.getGameElement})}async loadGamesArray(){this.FAVOURITES=await v.getWantToPlayGamesList({}),console.log(this.FAVOURITES)}FavouritesSection(){return this.librarySection=document.createElement("section"),this.librarySection.classList.add("favourites__section","section"),this.librarySection.appendChild(this.headerElement()),this.gameList=document.createElement("ul"),this.gameList.classList.add("games-list"),this.librarySection.appendChild(this.gameList),this.librarySection}headerElement(){let e=document.createElement("div");return e.classList.add("section__header-container"),e.innerHTML=`
        <div class="section__header-title">Want To Play</div>
        <div class="section__control-container">
        <!--  <button class=" simple-button" onclick="generateContextMenu(ui.library.gamesSortContext(),event)">Sort</button>
            <button class="games-platform-filter simple-button" onclick="generateContextMenu(ui.library.gamesPlatformContext(),event)">${this.platformFilter??"Platform"}</button>
            <div class="hidden-text-input__container">
            <input class="hidden-text-input__input" type="search">
            <button class="hidden-text-input__button icon-button simple-button search-icon show-searchbar__button"
                onclick="ui.library.showHiddenInput(this)"></button> -->

        </div>
            </div>
    `,e}getGameElement(e){let t={...e,badges:[],Points:e.PointsTotal,NumAchievements:e.AchievementsPublished};return G(t)}};var D,X,Q,we=({userName:a,apiKey:e,userObj:t})=>{n.USER_NAME=a,n.API_KEY=e,n.identConfirmed=!0,n.userImageSrc=`https://media.retroachievements.org${t?.UserPic}`,D.classList.remove("error"),D.classList.add("verified")},be=()=>{let a=X?.value??"",e=Q?.value??"";v.verifyUserIdent({userName:a,apiKey:e}).then(t=>{t.ID?(we({userName:a,apiKey:e,userObj:t}),setTimeout(()=>{c.goto.home(),location.reload(!0)},1e3)):(n.identConfirmed=!1,D.classList.add("error"),D.classList.remove("verified"))})},ce=()=>fetch("./sections/login.elem").then(e=>e.text()).then(e=>{let t=document.createElement("section");return t.className="login__section",t.innerHTML=e,D=t.querySelector("#login__submit-button"),X=t.querySelector("#login_user-name"),Q=t.querySelector("#login__api-key"),t}).then(e=>(X.value=n?.USER_NAME??"",Q.value=n?.API_KEY??"",D.classList.toggle("verified",n.identConfirmed),D.addEventListener("click",t=>{be()}),e));var me=()=>{let a=document.createElement("div");return a.classList.add("loading_screen"),a.innerHTML='<div class="loading_screen__loader-icon"></div>',a};var z=class{constructor(){this.update()}getSectionElement(){return u(`
            <div class="section unlocks__section">
                <div class="section__header-title">Recent Unlocks</div>
                <ul class="game-achivs__container list"></ul>
            </div>
        `)}async update(){c.showLoader();let e=await v.getLastUnlocks({count:20}),t=this.getSectionElement(),i=e.map(s=>Y(s));t.querySelector("ul")?.append(...i),c.content.innerHTML="",c.content.append(t),c.removeLoader()}};var f={},V=class{get favouritesGames(){return n.ui?.mobile?.favouritesGames??{}}get isSoftmode(){return n.ui?.mobile?.isSoftMode??!1}set isSoftmode(e){n.ui.mobile.isSoftMode=e,n.writeConfiguration()}switchGameMode(){this.isSoftmode=!this.isSoftmode,this.home=new L}routes={"/":async()=>{n.identConfirmed?(this.home=new L,this.clearNavbar(),this.navbar.home.classList.add("checked")):this.goto.login()},"/login":async()=>{this.showLoader();let e=await ce();content.innerHTML="",content.append(e),this.clearNavbar(),this.navbar.login.classList.add("checked"),this.removeLoader()},"/home":async()=>{n.identConfirmed?(this.home=new L,this.clearNavbar(),this.navbar.home.classList.add("checked")):this.goto.login()},"/awards":async()=>{n.identConfirmed?(this.awards=new F,this.clearNavbar(),this.navbar.awards.classList.add("checked")):this.goto.login()},"/library":async()=>{n.identConfirmed?(this.library=new W,this.clearNavbar(),this.navbar.library.classList.add("checked")):this.goto.login()},"/favourites":async()=>{n.identConfirmed?(this.favourites=new q,this.clearNavbar(),this.navbar.favourites.classList.add("checked")):this.goto.login()},"/game":async e=>{if(n.identConfirmed){let t=e.gameID?parseInt(e.gameID,10):!1;t&&(this.game=new O(t))}else this.goto.login()},"/unlocks":async e=>{n.identConfirmed?this.unlocks=new z:this.goto.login()},"/test":async()=>{content.innerHTML="",content.append(await Te())}};goto={home:()=>{history.pushState(null,null,"#/home"),this.updatePage()},awards:()=>{history.pushState(null,null,"#/awards"),this.updatePage()},library:()=>{history.pushState(null,null,"#/library"),this.updatePage()},favourites:()=>{history.pushState(null,null,"#/favourites"),this.updatePage()},game:e=>{history.pushState(null,null,`#/game&gameID=${e}`),this.updatePage()},login:()=>{history.pushState(null,null,"#/login"),this.updatePage()},unlocks:()=>{history.pushState(null,null,"#/unlocks"),this.updatePage()}};constructor(){!n.ui?.mobile&&(n.ui.mobile={},n.writeConfiguration()),this.initializeElements(),this.addEvents()}initializeElements(){!n.ui.mobile&&(n.ui.mobile={}),this.sectionContainer=document.querySelector(".section-container"),this.app=document.getElementById("app"),this.content=document.getElementById("content"),this.navbar={container:document.querySelector(".navbar"),home:document.querySelector("#navbar_home"),awards:document.querySelector("#navbar_awards"),library:document.querySelector("#navbar_library"),favourites:document.querySelector("#navbar_favourites"),login:document.querySelector("#navbar_login")},n.identConfirmed&&this.navbar.login.classList.add("hidden")}addEvents(){window.addEventListener("hashchange",()=>{this.updatePage()}),window.addEventListener("DOMContentLoaded",()=>{window.dispatchEvent(new Event("hashchange"))}),app.addEventListener("click",()=>{this.removeContext(),this.removePopups()}),app.addEventListener("mousedown",()=>{this.removeContext()})}clearNavbar(){this.navbar.container.querySelectorAll(".checked").forEach(e=>e.classList.remove("checked"))}updatePage(){let e=window.location.hash.substring(1),[t,i]=e.split("&"),s=this.routes[t]||this.routes["/"],r=new URLSearchParams(i),o={};for(let[d,l]of r.entries())o[d]=l;s(o)}removePopups(){document.querySelectorAll(".popup").forEach(e=>e.remove())}removeContext(){document.querySelectorAll(".context").forEach(e=>{e.classList.add("hidden"),setTimeout(()=>e.remove(),1e3)})}async showGameDetails(e){this.removePopups(),this.showLoader();let t=document.createElement("div");t.addEventListener("touchend",r=>r.stopPropagation()),t.classList.add("popup-info__container","popup"),f[e]?(t.innerHTML=this.gamePopupHtml(f[e]),this.content.append(t),this.removeLoader()):v.getGameProgress({gameID:e}).then(r=>{f[e]=r,console.log(r),t.innerHTML=this.gamePopupHtml(r),this.content.append(t)}).then(()=>this.removeLoader());let i=f[e],s=this.gamePopupHtml(i);t.innerHTML=s,await C(500),document.querySelectorAll(".popup-info__image").forEach(r=>{r.addEventListener("click",o=>{o.stopPropagation();let d=document.createElement("div");d.classList.add("image-preview-popup"),d.innerHTML=`
          <img src="${r.src}" alt="">
        `,c.content.appendChild(d),d.addEventListener("click",l=>{l.stopPropagation(),d.remove()})})})}gamePopupHtml(e){return`
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
          href="https://google.com/search?q='${e?.FixedTitle}' '${w[e?.ConsoleID]}' ${Se}" target="_blank"></a>
      <a class="round-button icon-button redirect-icon simple-button game-popup__ra-button"
          href="https://retroachievements.org/game/${e?.ID}" target="_blank"></a>
      <button class="${c.favouritesGames[e?.ID]?"checked":""} round-button icon-button like-icon simple-button game-popup__like-button"
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
    `}async showAchivDetails(e,t){if(this.removePopups(),this.showLoader(),f[t]){let i=document.createElement("div");i.addEventListener("touchend",o=>o.stopPropagation()),i.classList.add("popup-info__container","popup");let s=f[t].Achievements[e],r=this.achivPopupHtml(s);i.innerHTML=r,this.content.append(i),this.removeLoader()}else{let i=await v.getGameProgress({gameID:t});f[t]=i,this.showAchivDetails(e,t)}}achivPopupHtml(e){return`
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
        ${e?.isEarned?`<div class="popup-info__property">Date earned : <span>${I(e?.DateEarned)}</span></div>`:""}
        ${e?.isHardcoreEarned?`<div class="popup-info__property">Date earned hardcore: <span>${I(e?.DateEarnedHardcore)}</span></div>`:""}
        <div class="popup-info__property">Date created : <span>${new Date(e?.DateCreated).toLocaleDateString()}</span></div>
        <div class="popup-info__property">Author : <span>${e?.Author}</span></div>
    </div>
  `}expandGameItem(e,t){let i=t.closest("li");i.classList.toggle("expanded");let s=r=>{this.showLoader();let o=u(`
        <div class="user-info__game-achivs-container">
            <ul class ="user-info__game-achivs-list"/>
        </div>
      `),d=o.querySelector("ul");i.appendChild(o),f[r]?(Object.values(f[r].Achievements).sort((l,p)=>_.date(l,p)).forEach(l=>{d.innerHTML+=this.cheevoBadgeHtml(l,r)}),this.removeLoader()):v.getGameProgress({gameID:r}).then(l=>{f[r]=l,Object.values(l.Achievements).sort((p,m)=>_.date(p,m)).forEach(p=>{d.innerHTML+=this.cheevoBadgeHtml(p,r)})}).then(()=>this.removeLoader())};i.querySelector(".user-info__game-achivs-container")??s(e)}achivHtmlList(e,t){return`    
            <li class="user-info__achiv-container"  onclick="ui.showAchivDetails(${e.ID},${t}); event.stopPropagation();">                
                <div class="user-info__achiv-preview-container">
                    <img class="user-info__achiv-preview ${(e.isHardcoreEarned||c.isSoftmode&&e.isEarned)&&"earned"}" src="${e.prevSrc}" alt="">
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
        `}cheevoBadgeHtml(e,t){return`    
            <li class="ach-badge-item ${e.isHardcoreEarned?"hardcore":""} ${e.isEarned?"unlocked":""}"  onclick="ui.showAchivDetails(${e.ID},${t}); event.stopPropagation();">                
                <div class="ach-badge-preview">
                    <img class="ach-badge-image ${(e.isHardcoreEarned||c.isSoftmode&&e.isEarned)&&"earned"}" src="${e.prevSrc}"/>
                  <div class="achiv-rarity achiv-rarity__${e.difficulty}"></div>
                </div>
            </li>
        `}showLoader(){this.removeLoader(),this.app.append(me())}removeLoader(){document.querySelectorAll(".loading_screen").forEach(e=>e.remove())}},Te=()=>fetch("./sections/test.elem").then(e=>e.text()).then(e=>{let t=document.createElement("section");return t.className="test__section section",t.innerHTML=e,t});var Se="site:www.romhacking.net OR site:wowroms.com/en/roms OR site:cdromance.org OR site:coolrom.com.au/roms OR site:planetemu.net OR site:emulatorgames.net OR site:romsfun.com/roms OR site:emu-land.net/en";var n=new H,v=new U,c=new V;window.ui=c;window.generateContextMenu=M;})();
