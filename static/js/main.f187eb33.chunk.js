(this.webpackJsonpbuildmancer=this.webpackJsonpbuildmancer||[]).push([[0],{33:function(e,t,n){},34:function(e,t,n){},61:function(e,t,n){"use strict";n.r(t);var a=n(0),r=n.n(a),i=n(12),c=n.n(i),o=(n(33),n(8)),s=n(2),u=n(6),l=(n(34),n(35),n(63)),f=n(64),d=n(24),p=n(68),h=n(69),j=n(11),b=n(1),m=function(e){var t,n=e.enemy,a=e.isSelected,r=e.onSelect,i=e.latestAttack,c=e.canAct;return Object(b.jsx)(p.a,{bg:a?"info":void 0,children:Object(b.jsxs)(p.a.Body,{children:[Object(b.jsxs)(p.a.Title,{children:[n.lore.name,n.stats.hp>0?"":Object(b.jsx)("b",{children:" \ud83d\udc80DEAD\ud83d\udc80 "})]}),Object(b.jsxs)(p.a.Text,{children:[n.lore.name,". Has ",n.stats.hp," HP and is at distance"," ",n.stats.distance]}),i&&Object(b.jsxs)(p.a.Text,{children:["Latest attack: ",i]}),Object(b.jsx)(p.a.Text,{children:"Next attack prediction:"}),(t=n.rolls[n.stats.distance-1].map((function(e){return n.effects[e]})),Object(j.a)(t).countBy((function(e){return e.display})).toArray().map((function(e,n){var a=Object(u.a)(e,2),r=a[0],i=a[1];return Object(b.jsxs)(p.a.Text,{children:["[",(i/t.length*100).toFixed(2),"%] ",r]},n)}))),c&&Object(b.jsx)(h.a,{disabled:a,onClick:r,children:"Select"})]})})},y=n(70),O=function(e){var t=e.selectedButtons,n=e.player,a=e.onClickEffect,r=e.canAct,i=e.lastAction;return Object(b.jsxs)(p.a,{children:[Object(b.jsxs)(p.a.Body,{children:[Object(b.jsxs)(p.a.Title,{children:[n.lore.name,n.stats.hp>0?"":Object(b.jsx)("b",{children:" \ud83d\udc80DEAD\ud83d\udc80 "})]}),Object(b.jsx)(p.a.Subtitle,{className:"mb-2 text-muted",children:n.build.class.display}),Object(b.jsxs)(p.a.Text,{children:["Has ",n.stats.hp," HP and ",n.stats.stamina," stamina"]}),i&&Object(b.jsxs)(p.a.Text,{children:["Last action: ",i]})]}),r&&Object(b.jsx)(p.a.Body,{children:Object(b.jsx)(y.a,{direction:"horizontal",gap:2,children:Object.values(n.build).flatMap((function(e){return e.effects})).map((function(e,r){return Object(b.jsxs)(h.a,{active:t.has(e.display),disabled:n.stats.stamina<e.stamina,onClick:function(e){return a(r)},children:["[",Object(b.jsx)("b",{children:e.display})," ",Object(b.jsx)("i",{children:r+1}),"]",Object(b.jsx)("br",{}),"Sta: ",e.stamina," | Prio: ",e.priority]},e.display)}))})})]})};var v=function(e){return e.states[0]},x=function(e){return e.states[e.states.length-1]},g={"Basic:Rest":function(e,t,n){return n},"Basic:Advance":function(e,t,n){return E.changeDistance(n,n.target,-2)},"Basic:Retreat":function(e,t,n){return E.changeDistance(n,n.target,2)},"Axe:Chop":function(e,t,n){return E.attackMonster(v(t),n,3)},"Axe:Cut":function(e,t,n){return E.attackMonster(v(t),n,3)},"Hook:GetHere":function(){for(var e=arguments.length,t=new Array(e),n=0;n<e;n++)t[n]=arguments[n];return t.reduce((function(e,t){return function(n,a,r){return t(n,a,e(n,a,r))}}))}((function(e,t,n){return E.attackMonster(v(t),n,3)}),(function(e,t,n){return E.changeDistance(n,n.target,-1)})),"Monster:Swipe":function(e,t,n){return E.attackPlayer(v(t),n,2)},"Monster:Roar":function(e,t,n){return E.modifyPlayerStamina(v(t),n,-5)},"Monster:Jump":function(e,t,n){return E.changeDistance(n,e,-2)}},k={basic:[{display:"Basic",effects:[{display:"Rest",effect:"Basic:Rest",priority:4,stamina:0},{display:"Advance",effect:"Basic:Advance",priority:4,stamina:1},{display:"Retreat",effect:"Basic:Retreat",priority:4,stamina:1}]}],class:[{display:"Warrior",effects:[]},{display:"Mage",effects:[]},{display:"Rogue",effects:[]}],skill:[{display:"Sturdy",effects:[]},{display:"Nimble",effects:[]}],weapon:[{display:"Axe",effects:[{display:"Chop",effect:"Axe:Chop",priority:2,stamina:2},{display:"Cut",effect:"Axe:Cut",priority:3,stamina:2}]}],offhand:[{display:"Hook",effects:[{display:"Get over here!",effect:"Hook:GetHere",priority:4,stamina:3}]}],consumable:[{display:"Potion",effects:[]}],armor:[{display:"Heavy",effects:[]}],headgear:[{display:"Helm",effects:[]}],footwear:[{display:"Boots",effects:[]}],charm:[{display:"of Health",effects:[]}]},S=function(){return A[Math.floor(Math.random()*A.length)]},w=[{lore:{name:"Sacapuntas"},stats:{hp:25,rage:0,distance:5},rolls:[[0,1,2,1,0],[0,1,0,0,0],[0,0,0,0,0],[0,0,0,0,0],[0,1,2,1,0,0]],effects:[{display:"Swipe",priority:3,effect:"Monster:Swipe"},{display:"Roar",priority:1,effect:"Monster:Roar"},{display:"Jump",priority:2,effect:"Monster:Jump"}]},{lore:{name:"Cacahue"},stats:{hp:30,rage:0,distance:5},effects:[{display:"Swipe",priority:3,effect:"Monster:Swipe"},{display:"Roar",priority:1,effect:"Monster:Roar"},{display:"Jump",priority:2,effect:"Monster:Jump"}],rolls:[[0,0,0,1,0],[0,0,0,0,0],[0,0,0,0,0],[0,0,0,0,0],[0,0,2,0,0]]},{lore:{name:"Toro"},stats:{hp:22,rage:0,distance:5},effects:[{display:"Swipe",priority:3,effect:"Monster:Swipe"},{display:"Roar",priority:1,effect:"Monster:Roar"},{display:"Jump",priority:2,effect:"Monster:Jump"}],rolls:[[0,0,0,1,0],[0,0,0,0,0],[0,0,0,0,0],[0,0,0,0,0],[0,0,2,0,0]]}],A=["Lydan","Syrin","Ptorik","Joz","Varog","Gethrod","Hezra","Feron","Ophni","Colborn","Fintis","Gatlin","Jinto","Hagalbar","Krinn","Lenox","Revvyn","Hodus","Dimian","Paskel","Kontas","Weston","Azamarr ","Jather ","Tekren ","Jareth","Adon","Zaden","Eune ","Graff","Tez","Jessop","Gunnar","Pike","Domnhar","Baske","Jerrick","Mavrek","Riordan","Wulfe","Straus","Tyvrik ","Henndar","Favroe","Whit","Jaris","Renham","Kagran","Lassrin ","Vadim","Arlo","Quintis","Vale","Caelan","Yorjan","Khron","Ishmael","Jakrin","Fangar","Roux","Baxar","Hawke","Gatlen","Barak","Nazim","Kadric","Paquin","Kent","Moki","Rankar","Lothe","Ryven","Clawsen","Pakker","Embre","Cassian","Verssek","Dagfinn","Ebraheim","Nesso","Eldermar","Rivik","Rourke","Barton","Hemm","Sarkin","Blaiz ","Talon","Agro","Zagaroth","Turrek","Esdel","Lustros","Zenner","Baashar ","Dagrod ","Gentar","Feston","Syrana","Resha","Varin","Wren","Yuni","Talis","Kessa","Magaltie","Aeris","Desmina","Krynna","Asralyn ","Herra","Pret","Kory","Afia","Tessel","Rhiannon","Zara","Jesi","Belen","Rei","Ciscra","Temy","Renalee ","Estyn","Maarika","Lynorr","Tiv","Annihya","Semet","Tamrin","Antia","Reslyn","Basak","Vixra","Pekka ","Xavia","Beatha ","Yarri","Liris","Sonali","Razra ","Soko","Maeve","Everen","Yelina","Morwena","Hagar","Palra","Elysa","Sage","Ketra","Lynx","Agama","Thesra ","Tezani","Ralia","Esmee","Heron","Naima","Rydna ","Sparrow","Baakshi ","Ibera","Phlox","Dessa","Braithe","Taewen","Larke","Silene","Phressa","Esther","Anika","Rasy ","Harper","Indie","Vita","Drusila","Minha","Surane","Lassona","Merula","Kye","Jonna","Lyla","Zet","Orett","Naphtalia","Turi","Rhays","Shike","Hartie","Beela","Leska","Vemery ","Lunex","Fidess","Tisette","Partha"],B=n(18),M=n.n(B),F=function(e,t,n){return Math.min(Math.max(e,t),n)};function T(e,t,n){var a=new B.Chance(n),r=Object(o.a)(Array(e).keys()).map((function(e){return Object(o.a)(Array(t).keys()).map((function(e){return a.floating({min:0,max:1,fixed:2})}))}));return function(e){var t=Object(o.a)(r[e]);return function(e,n){return Math.floor((n-e)*t.pop()+e)}}}var P=function(e,t,n){return e.map((function(e,a){return a===t?Object(s.a)(Object(s.a)({},e),{},{stats:Object(s.a)(Object(s.a)({},e.stats),n(e.stats))}):e}))},R=function(e){return Object.values(e.build).flatMap((function(e){return e.effects}))},E={attackMonster:function(e,t,n){return Object(s.a)(Object(s.a)({},t),{},{enemies:P(t.enemies,t.target,(function(a){var r=a.hp;return{hp:F(r-n,0,e.enemies[t.target].stats.hp)}}))})},changeDistance:function(e,t,n){return Object(s.a)(Object(s.a)({},e),{},{enemies:P(e.enemies,t,(function(e){var t=e.distance;return{distance:F(t+n,1,5)}}))})},attackPlayer:function(e,t,n){return Object(s.a)(Object(s.a)({},t),{},{player:Object(s.a)(Object(s.a)({},t.player),{},{stats:Object(s.a)(Object(s.a)({},t.player.stats),{},{hp:F(t.player.stats.hp-n,0,e.player.stats.hp)})})})},modifyPlayerStamina:function(e,t,n){return Object(s.a)(Object(s.a)({},t),{},{player:Object(s.a)(Object(s.a)({},t.player),{},{stats:Object(s.a)(Object(s.a)({},t.player.stats),{},{stamina:F(t.player.stats.stamina+n,0,e.player.stats.stamina)})})})}};var C=function(e,t,n){var a=x(e),r=a.enemies,i=a.player,c=R(i)[t],l=n(e.states.length-1),f=Object(j.a)(r).map((function(e,t){return[t,e.effects[e.rolls[e.stats.distance-1][l(0,e.rolls[e.stats.distance-1].length)]]]})).concat([["Player",c]]).sortBy((function(e){var t=Object(u.a)(e,2);t[0];return t[1].priority})),d=E.modifyPlayerStamina(e.states[0],x(e),i.stats.staminaPerTurn-c.stamina);d.lastAttacks=f.map((function(e){var t=Object(u.a)(e,2);return[t[0],t[1].effect]})).toArray();var p=f.reduce((function(t,n){var a=Object(u.a)(n,2),r=a[0],i=a[1];return g[i.effect](r,e,t)}),d);return Object(s.a)(Object(s.a)({},e),{},{states:[].concat(Object(o.a)(e.states),[p])})},H=function(e,t){return e.states[e.states.length-1].target=t,{states:Object(o.a)(e.states)}},L=function(e){var t,n=e.handlePlayerEffect,r=e.setSelected,i=e.game,c=e.solveGame,s=e.undo,y=x(i),v=y.player,g=y.enemies,k=y.target,S=y.lastAttacks,w=R(v),A=g.reduce((function(e,t){return t.stats.hp+e}),0),B=v.stats.hp>0,M=A>0,F=B&&M,T=function(e){var t=Object(a.useState)(new Set),n=Object(u.a)(t,2),r=n[0],i=n[1],c=function(e){var t=e.key;i((function(e){return new Set([].concat(Object(o.a)(e),[t]))}))},s=Object(a.useCallback)((function(t){var n=t.key;i((function(e){return new Set(Object(o.a)(e).filter((function(e){return e!==n})))})),e(n)}),[e]);return Object(a.useEffect)((function(){return window.addEventListener("keydown",c),window.addEventListener("keyup",s),function(){window.removeEventListener("keydown",c),window.removeEventListener("keyup",s)}}),[s]),r}((function(e){if(F){var t=parseInt(e);t>0&&t<=w.length&&n(t-1)}})),P=new Set(Object(o.a)(T).flatMap((function(e){var t=parseInt(e);return t>0&&t<=w.length?[w[t-1].display]:[]})));return Object(b.jsx)(l.a,{fluid:!0,children:Object(b.jsx)(f.a,{className:"justify-content-center align-items-flex-start",children:Object(b.jsxs)(d.a,{sm:12,md:8,children:[Object(b.jsx)(f.a,{children:Object(b.jsxs)(p.a.Title,{children:["Turn ",i.states.length," ",B?M?"":Object(b.jsx)("b",{children:"\ud83c\udf89\ud83c\udf89VICTORY\ud83c\udf89\ud83c\udf89"}):Object(b.jsx)("b",{children:"\u274c\u274cDEFEAT\u274c\u274c"})]})}),Object(b.jsx)(f.a,{children:Object(b.jsx)(d.a,{children:Object(b.jsx)(O,{player:v,onClickEffect:n,selectedButtons:P,lastAction:(null!==(t=S.find((function(e){return"Player"===e[0]})))&&void 0!==t?t:[void 0,void 0])[1],canAct:F})})}),Object(b.jsx)(f.a,{className:"mt-2 g-2",children:g.map((function(e,t){return Object(b.jsx)(d.a,{xs:6,md:4,children:Object(b.jsx)(m,{enemy:e,canAct:F,latestAttack:Object(j.a)(S).filter((function(e){var n=Object(u.a)(e,2),a=n[0];n[1];return a===t})).map((function(e){return e[1]})).first(),isSelected:t===k,onSelect:function(){return r(t)}},t)},t)}))}),Object(b.jsxs)(f.a,{children:[Object(b.jsx)(h.a,{onClick:function(e){return s()},children:"Undo \u21a9"}),Object(b.jsx)(h.a,{onClick:function(e){return c(100)},children:"Solve \u231b"}),Object(b.jsx)(h.a,{onClick:function(e){return c(1e3)},children:"Solve thoroughly \u231b\u231b\u231b"})]})]})})})},D=n(7),J=n(67),z=n(66),N=n(65);var W=Object.entries(k).map((function(e){var t=Object(u.a)(e,2);return{type:t[0],options:t[1].map((function(e,t){return{display:e.display,value:t}}))}})),G=function(e){var t=e.isSelected,n=e.section,r=e.options,i=e.setField,c=function(e){var t=Object(a.useRef)(null);return[function(){return t.current.scrollIntoView(e)},t]}({behavior:"smooth",block:"start"}),o=Object(u.a)(c,2),s=o[0],l=o[1];return Object(b.jsxs)(f.a,{children:[Object(b.jsx)(J.a.Label,{children:n}),Object(b.jsx)("br",{}),Object(b.jsx)(N.a,{size:"lg",className:"mb-2",children:r.map((function(e){var a=e.display,r=e.value;return Object(b.jsx)(h.a,{name:n,id:"".concat(r),variant:t(r)?"primary":"secondary",onClick:function(){i(r),s()},children:a},r)}))}),Object(b.jsx)("div",{id:"".concat(n,"-scroll"),ref:l})]})},K=function(e){var t=e.onSave,n=r.a.useState(W.reduce((function(e,t){var n=t.type,a=t.options;return Object(s.a)(Object(s.a)({},e),{},Object(D.a)({},n,a[0].value))}),{})),a=Object(u.a)(n,2),i=a[0],c=a[1],o=r.a.useState({name:S(),age:Math.floor(50*Math.random()+16)}),d=Object(u.a)(o,2),p=d[0],j=d[1],m=function(e){return Object(b.jsx)("b",{children:k[e][i[e]].display})};return Object(b.jsx)(J.a,{onSubmit:function(e){e.preventDefault(),t({id:"p-1",lore:p,stats:{hp:25,stamina:8,staminaPerTurn:2},build:Object.entries(i).reduce((function(e,t){var n=Object(u.a)(t,2),a=n[0],r=n[1];return Object(s.a)(Object(s.a)({},e),{},Object(D.a)({},a,k[a][r]))}),{basic:k.basic[0]})})},children:Object(b.jsxs)(l.a,{fluid:!0,style:{marginBottom:"105px"},children:[Object(b.jsx)(f.a,{className:"g-2",children:W.map((function(e){var t=e.type,n=e.options;return Object(b.jsx)(G,{setField:function(e){return function(e,t){c(Object(s.a)(Object(s.a)({},i),{},Object(D.a)({},e,t)))}(t,e)},section:t,options:n,isSelected:function(e){return i[t]===e}},t)}))}),Object(b.jsx)(z.a,{fixed:"bottom",bg:"dark",variant:"dark",style:{maxHeight:"100px"},children:Object(b.jsxs)(l.a,{children:[Object(b.jsxs)(z.a.Text,{children:["You are ",Object(b.jsx)("i",{onClick:function(){return j((function(e){return Object(s.a)(Object(s.a)({},e),{},{name:S()})}))},children:p.name}),", the ",m("skill")," ",m("class")," ",m("charm"),Object(b.jsx)("br",{}),"who wields a ",m("weapon")," and a ",m("offhand"),Object(b.jsx)("br",{}),"and wears ",m("armor")," with ",m("headgear")," and ",m("footwear")]}),Object(b.jsx)(h.a,{type:"submit",children:"Pick your foe!"})]})})]})})},V=function(e){var t=e.player,n=e.onSave,a=r.a.useState([]),i=Object(u.a)(a,2),c=i[0],s=i[1],f=function(e){return Object(b.jsx)("b",{children:t.build[e].display})};return Object(b.jsxs)(J.a,{onSubmit:function(e){e.preventDefault(),n(Object(o.a)(c))},children:[Object(b.jsx)(l.a,{fluid:!0,style:{marginBottom:c.length>0?"205px":"105px"},children:Object(b.jsx)(N.a,{size:"lg",className:"mb-2",children:w.map((function(e){return Object(b.jsx)(h.a,{onClick:function(){return c.length<5?s((function(t){return[].concat(Object(o.a)(t),[e])})):void 0},children:e.lore.name},e.lore.name)}))})}),c.length>0&&Object(b.jsx)(z.a,{fixed:"bottom",bg:"dark",variant:"dark",style:{marginBottom:"100px"},children:Object(b.jsx)(l.a,{fluid:!0,children:Object(b.jsx)(N.a,{size:"sm",className:"mb-2",children:c.map((function(e,t){return Object(b.jsx)(h.a,{onClick:function(){return s((function(t){var n=!1;return t.filter((function(t){return n||t.lore.name!==e.lore.name||!(n=!0)}))}))},children:e.lore.name},"".concat(e.lore.name,"-").concat(t))}))})})}),Object(b.jsx)(z.a,{fixed:"bottom",bg:"dark",variant:"dark",style:{maxHeight:"100px"},children:Object(b.jsxs)(l.a,{children:[Object(b.jsxs)(z.a.Text,{children:["You are ",Object(b.jsx)("i",{children:t.lore.name}),", the ",f("skill")," ",f("class")," ",f("charm"),Object(b.jsx)("br",{}),"who wields a ",f("weapon")," and a ",f("offhand"),Object(b.jsx)("br",{}),"and wears ",f("armor")," with ",f("headgear")," and ",f("footwear")]}),Object(b.jsx)(h.a,{type:"submit",disabled:c.length<1,children:"To Battle!"})]})})]})};function I(e){function t(e,t){if((e=e||{}).mutationFunction=e.mutationFunction||t.mutationFunction,e.crossoverFunction=e.crossoverFunction||t.crossoverFunction,e.fitnessFunction=e.fitnessFunction||t.fitnessFunction,e.doesABeatBFunction=e.doesABeatBFunction||t.doesABeatBFunction,e.population=e.population||t.population,e.population.length<=0)throw Error("population must be an array and contain at least 1 phenotypes");if(e.populationSize=e.populationSize||t.populationSize,e.populationSize<=0)throw Error("populationSize must be greater than 0");return e}var n=t(e,{mutationFunction:function(e){return e},crossoverFunction:function(e,t){return[e,t]},fitnessFunction:function(e){return 0},doesABeatBFunction:void 0,population:[],populationSize:100});function a(e){return JSON.parse(JSON.stringify(e))}function r(e){return n.mutationFunction(a(e))}function i(e){e=a(e);var t=n.population[Math.floor(Math.random()*n.population.length)];return t=a(t),n.crossoverFunction(e,t)[0]}return{evolve:function(e){return e&&(n=t(e,n)),function(){for(var e=n.population.length;n.population.length<n.populationSize;){var t=Math.floor(Math.random()*e);n.population.push(r(a(n.population[Math.floor(t)])))}}(),function(){for(var e=0;e<n.population.length;e++){var t=Math.floor(Math.random()*n.population.length),a=n.population[t];n.population[t]=n.population[e],n.population[e]=a}}(),function(){for(var e,t,a=[],c=0;c<n.population.length-1;c+=2){var o=n.population[c],s=n.population[c+1];a.push(o),e=o,t=s,(n.doesABeatBFunction?n.doesABeatBFunction(e,t):n.fitnessFunction(e)>=n.fitnessFunction(t))?Math.random()<.5?a.push(r(o)):a.push(i(o)):a.push(s)}n.population=a}(),this},best:function(){var e=this.scoredPopulation();return a(e.reduce((function(e,t){return e.score>=t.score?e:t}),e[0]).phenotype)},bestScore:function(){return n.fitnessFunction(this.best())},population:function(){return a(this.config().population)},scoredPopulation:function(){return this.population().map((function(e){return{phenotype:a(e),score:n.fitnessFunction(e)}}))},config:function(){return a(n)},clone:function(e){return I(t(e,t(this.config(),n)))}}}n(28);var Y={playerSeed:"Miau",turns:50,weights:{monster:.8,player:.15,turn:.05},debug:!1,randPerTurn:10};var Z=function(){var e=r.a.useState("buildPlayer"),t=Object(u.a)(e,2),n=t[0],a=t[1],i=r.a.useState(),c=Object(u.a)(i,2),l=c[0],f=c[1],d=r.a.useState(),p=Object(u.a)(d,2),h=p[0],m=p[1],y=r.a.useState(),O=Object(u.a)(y,2),v=O[0],g=O[1];if(!v&&l&&h){var k=function(e,t){return{states:[{player:e,enemies:t,target:0,lastAttacks:[]}]}}(l,h);g(k)}return Object(b.jsxs)("div",{className:"App",children:["buildPlayer"===n?Object(b.jsx)(K,{onSave:function(e){f(e),a("buildEncounter")}}):null,"buildEncounter"===n&&l?Object(b.jsx)(V,{player:l,onSave:function(e){m(e),a("game")}}):null,"game"===n&&v?Object(b.jsx)(L,{game:v,undo:function(){return g(Object(s.a)(Object(s.a)({},v),{},{states:[v.states[0]].concat(Object(o.a)(v.states.slice(1,-1)))}))},setSelected:function(e){return g(H(v,e))},handlePlayerEffect:function(e){return g(C(v,e,T(50,10,"SEED")))},solveGame:function(e){return g(Object(j.a)(function(e,t,n,a){for(var r=Object(s.a)(Object(s.a)({},Y),a),i=Object(o.a)(Array(t).keys()),c=new M.a(r.playerSeed),l=new I({mutationFunction:function(e){var t=x(e),a=t.enemies.reduce((function(e,t){return e+t.stats.hp}),0);if(0===t.player.stats.hp||0===a)return e;var i=e;6===c.d6()&&(i=H(i,c.natural({min:0,max:x(i).enemies.length-1})));var o=x(i),s=R(o.player),l=s.map((function(e,t){return[e,t]})).filter((function(e){var t=Object(u.a)(e,2),n=t[0];return t[1],n.stamina>o.player.stats.stamina})).map((function(e){var t=Object(u.a)(e,2);return t[0],t[1]}));return C(i,c.natural({min:0,max:s.length-1,exclude:l}),T(r.turns,r.randPerTurn,n))},fitnessFunction:function(e){var t=x(e),n=t.enemies.reduce((function(e,t){return e+t.stats.hp}),0),a=t.player.stats.hp,i=e.states[0].player.stats.hp,c=e.states[0].enemies.reduce((function(e,t){return e+t.stats.hp}),0),o=(c-n)/c,s=a/i,u=(r.turns-e.states.length)/r.turns,l=o*r.weights.monster+s*r.weights.player+u*r.weights.turn;return r.debug&&console.log("MH: ".concat(n," | PH: ").concat(a," | TR: ").concat(e.states.length,"\nFitness: ").concat(l," | MF: ").concat(o," | PF: ").concat(s," | TF: ").concat(u)),l},population:i.map((function(t){return e})),populationSize:t}),f=0;f<r.turns;f++)l=l.evolve();return l.scoredPopulation()}(v,e,"SEED",Object(s.a)(Object(s.a)({},Y),{},{turns:50-v.states.length}))).maxBy((function(e){return e.score})).phenotype)}}):null]})},U=Boolean("localhost"===window.location.hostname||"[::1]"===window.location.hostname||window.location.hostname.match(/^127(?:\.(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)){3}$/));function q(e,t){navigator.serviceWorker.register(e).then((function(e){e.onupdatefound=function(){var n=e.installing;null!=n&&(n.onstatechange=function(){"installed"===n.state&&(navigator.serviceWorker.controller?(console.log("New content is available and will be used when all tabs for this page are closed. See https://cra.link/PWA."),t&&t.onUpdate&&t.onUpdate(e)):(console.log("Content is cached for offline use."),t&&t.onSuccess&&t.onSuccess(e)))})}})).catch((function(e){console.error("Error during service worker registration:",e)}))}var Q=function(e){e&&e instanceof Function&&n.e(3).then(n.bind(null,71)).then((function(t){var n=t.getCLS,a=t.getFID,r=t.getFCP,i=t.getLCP,c=t.getTTFB;n(e),a(e),r(e),i(e),c(e)}))};c.a.render(Object(b.jsx)(r.a.StrictMode,{children:Object(b.jsx)(Z,{})}),document.getElementById("root")),function(e){if("serviceWorker"in navigator){if(new URL("/buildmancer",window.location.href).origin!==window.location.origin)return;window.addEventListener("load",(function(){var t="".concat("/buildmancer","/service-worker.js");U?(!function(e,t){fetch(e,{headers:{"Service-Worker":"script"}}).then((function(n){var a=n.headers.get("content-type");404===n.status||null!=a&&-1===a.indexOf("javascript")?navigator.serviceWorker.ready.then((function(e){e.unregister().then((function(){window.location.reload()}))})):q(e,t)})).catch((function(){console.log("No internet connection found. App is running in offline mode.")}))}(t,e),navigator.serviceWorker.ready.then((function(){console.log("This web app is being served cache-first by a service worker. To learn more, visit https://cra.link/PWA")}))):q(t,e)}))}}(),Q()}},[[61,1,2]]]);
//# sourceMappingURL=main.f187eb33.chunk.js.map