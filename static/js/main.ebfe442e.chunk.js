(this.webpackJsonpbuildmancer=this.webpackJsonpbuildmancer||[]).push([[0],{34:function(e,t,n){},35:function(e,t,n){},62:function(e,t,n){"use strict";n.r(t);var a=n(0),r=n.n(a),i=n(12),c=n.n(i),s=(n(34),n(2)),o=n(7),u=n(6),l=(n(35),n(36),n(64)),f=n(65),d=n(25),p=n(69),j=n(70),h=n(11),b=n(1),m=function(e){var t,n=e.enemy,a=e.isSelected,r=e.onSelect,i=e.latestAttack,c=e.canAct;return Object(b.jsx)(p.a,{bg:a?"info":void 0,children:Object(b.jsxs)(p.a.Body,{children:[Object(b.jsxs)(p.a.Title,{children:[n.lore.name," ",n.stats.hp>0?"":Object(b.jsx)("b",{children:"\ud83d\udc80DEAD\ud83d\udc80"})]}),Object(b.jsxs)(p.a.Text,{children:["\u2764:",n.stats.hp," \ud83c\udff9:",n.stats.distance]}),i&&Object(b.jsxs)(p.a.Text,{children:["Latest attack: ",i]}),Object(b.jsxs)(p.a.Text,{children:["Next attack prediction:",Object(b.jsx)("br",{}),(t=n.rolls[n.stats.distance-1].map((function(e){return n.effects[e]})),Object(h.a)(t).countBy((function(e){return e.display})).toArray().map((function(e,n){var a=Object(u.a)(e,2),r=a[0],i=a[1],c=t.find((function(e){return e.display===r})),s=c.range,o=c.priority;return Object(b.jsxs)(b.Fragment,{children:["[",(i/t.length*100).toFixed(2),"%] ",r," \u23f1:",o," \ud83c\udff9:",5===s.length?"Any":s.map((function(e){return e+1})).join(","),Object(b.jsx)("br",{},n)]})}))),Object(b.jsx)("br",{})]}),c&&Object(b.jsx)(j.a,{disabled:a,onClick:r,children:"Select"})]})})},O=n(71),y=function(e){var t=e.selectedButtons,n=e.player,a=e.onClickEffect,r=e.canAct,i=e.lastAction;return Object(b.jsxs)(p.a,{children:[Object(b.jsxs)(p.a.Body,{children:[Object(b.jsxs)(p.a.Title,{children:[n.lore.name,n.stats.hp>0?"":Object(b.jsx)("b",{children:" \ud83d\udc80DEAD\ud83d\udc80 "})]}),Object(b.jsx)(p.a.Subtitle,{className:"mb-2 text-muted",children:n.build.class.display}),Object(b.jsxs)(p.a.Text,{children:[n.stats.hp," \u2764 ",n.stats.stamina," \ud83d\udcaa"]}),i&&Object(b.jsxs)(p.a.Text,{children:["Last action: ",i]})]}),r&&Object(b.jsx)(p.a.Body,{children:Object(b.jsx)(O.a,{direction:"horizontal",gap:2,children:Object.values(n.build).flatMap((function(e){return e.effects})).map((function(e,r){return Object(b.jsxs)("div",{children:[Object(b.jsxs)(j.a,{active:t.has(e.display),disabled:n.stats.stamina<e.stamina,onClick:function(e){return a(r)},children:["[",Object(b.jsx)("i",{children:r+1}),"] ",Object(b.jsx)("b",{children:e.display})]},e.display),Object(b.jsxs)(p.a.Text,{children:["\ud83d\udcaa:",e.stamina," \u23f1:",e.priority,Object(b.jsx)("br",{}),"\ud83c\udff9:",5===e.range.length?"Any":e.range.map((function(e){return e+1})).join(",")]})]})}))})})]})};var g=n(13),v=n.n(g),x=function(e){return e.states[0]},k=function(e){return e.states[e.states.length-1]},w=function(){for(var e=arguments.length,t=new Array(e),n=0;n<e;n++)t[n]=arguments[n];return Object(o.a)(new Set(t))},S=w(0,1,2,3,4),A={"Basic:Rest":function(e,t,n){return n},"Basic:Advance":function(e,t,n){return J.changeDistance(n,n.target,-2)},"Basic:Retreat":function(e,t,n){return J.changeDistance(n,n.target,2)},"Axe:Chop":function(e,t,n){return J.attackMonster(x(t),n,3)},"Axe:Cut":function(e,t,n){return J.attackMonster(x(t),n,3)},"Hook:GetHere":function(){for(var e=arguments.length,t=new Array(e),n=0;n<e;n++)t[n]=arguments[n];return t.reduce((function(e,t){return function(n,a,r){return t(n,a,e(n,a,r))}}))}((function(e,t,n){return J.attackMonster(x(t),n,3)}),(function(e,t,n){return J.changeDistance(n,n.target,-1)})),"Monster:Swipe":function(e,t,n){return J.attackPlayer(x(t),n,2)},"Monster:Roar":function(e,t,n){return J.modifyPlayerStamina(x(t),n,-5)},"Monster:Jump":function(e,t,n){return J.changeDistance(n,e,-2)}},B={basic:[{display:"Basic",effects:[{display:"Rest",effect:"Basic:Rest",priority:4,stamina:0,range:S},{display:"Advance",effect:"Basic:Advance",priority:4,stamina:1,range:S},{display:"Retreat",effect:"Basic:Retreat",priority:4,stamina:1,range:S}]}],class:[{display:"Warrior",effects:[]},{display:"Mage",effects:[]},{display:"Rogue",effects:[]}],skill:[{display:"Sturdy",effects:[]},{display:"Nimble",effects:[]}],weapon:[{display:"Axe",effects:[{display:"Chop",effect:"Axe:Chop",priority:2,stamina:2,range:w(0,1)},{display:"Cut",effect:"Axe:Cut",priority:3,stamina:2,range:w(0)}]}],offhand:[{display:"Hook",effects:[{display:"Get over here!",effect:"Hook:GetHere",priority:4,stamina:3,range:w(2,3,4)}]}],consumable:[{display:"Potion",effects:[]}],armor:[{display:"Heavy",effects:[]}],headgear:[{display:"Helm",effects:[]}],footwear:[{display:"Boots",effects:[]}],charm:[{display:"of Health",effects:[]}]},F=function(){return T[Math.floor(Math.random()*T.length)]},M=[{lore:{name:"Sacapuntas"},stats:{hp:25,rage:0,distance:4},rolls:[[0,1,2,1,0],[0,1,0,0,0],[0,0,0,0,0],[0,0,0,0,0],[0,1,2,1,0,0]],effects:[{display:"Swipe",priority:3,effect:"Monster:Swipe",range:w(0,1)},{display:"Roar",priority:1,effect:"Monster:Roar",range:w(0,1,2,3,4)},{display:"Jump",priority:2,effect:"Monster:Jump",range:w(2,3,4)}]},{lore:{name:"Cacahue"},stats:{hp:30,rage:0,distance:4},effects:[{display:"Swipe",priority:3,effect:"Monster:Swipe",range:w(0,1)},{display:"Roar",priority:1,effect:"Monster:Roar",range:w(0,1,2,3,4)},{display:"Jump",priority:2,effect:"Monster:Jump",range:w(2,3,4)}],rolls:[[0,0,0,1,0],[0,0,0,0,0],[0,0,0,0,0],[0,0,0,0,0],[0,0,2,0,0]]},{lore:{name:"Toro"},stats:{hp:22,rage:0,distance:4},effects:[{display:"Swipe",priority:3,effect:"Monster:Swipe",range:w(0,1)},{display:"Roar",priority:1,effect:"Monster:Roar",range:w(0,1,2,3,4)},{display:"Jump",priority:2,effect:"Monster:Jump",range:w(2,3,4)}],rolls:[[0,0,0,1,0],[0,0,0,0,0],[0,0,0,0,0],[0,0,0,0,0],[0,0,2,0,0]]}],T=["Lydan","Syrin","Ptorik","Joz","Varog","Gethrod","Hezra","Feron","Ophni","Colborn","Fintis","Gatlin","Jinto","Hagalbar","Krinn","Lenox","Revvyn","Hodus","Dimian","Paskel","Kontas","Weston","Azamarr ","Jather ","Tekren ","Jareth","Adon","Zaden","Eune ","Graff","Tez","Jessop","Gunnar","Pike","Domnhar","Baske","Jerrick","Mavrek","Riordan","Wulfe","Straus","Tyvrik ","Henndar","Favroe","Whit","Jaris","Renham","Kagran","Lassrin ","Vadim","Arlo","Quintis","Vale","Caelan","Yorjan","Khron","Ishmael","Jakrin","Fangar","Roux","Baxar","Hawke","Gatlen","Barak","Nazim","Kadric","Paquin","Kent","Moki","Rankar","Lothe","Ryven","Clawsen","Pakker","Embre","Cassian","Verssek","Dagfinn","Ebraheim","Nesso","Eldermar","Rivik","Rourke","Barton","Hemm","Sarkin","Blaiz ","Talon","Agro","Zagaroth","Turrek","Esdel","Lustros","Zenner","Baashar ","Dagrod ","Gentar","Feston","Syrana","Resha","Varin","Wren","Yuni","Talis","Kessa","Magaltie","Aeris","Desmina","Krynna","Asralyn ","Herra","Pret","Kory","Afia","Tessel","Rhiannon","Zara","Jesi","Belen","Rei","Ciscra","Temy","Renalee ","Estyn","Maarika","Lynorr","Tiv","Annihya","Semet","Tamrin","Antia","Reslyn","Basak","Vixra","Pekka ","Xavia","Beatha ","Yarri","Liris","Sonali","Razra ","Soko","Maeve","Everen","Yelina","Morwena","Hagar","Palra","Elysa","Sage","Ketra","Lynx","Agama","Thesra ","Tezani","Ralia","Esmee","Heron","Naima","Rydna ","Sparrow","Baakshi ","Ibera","Phlox","Dessa","Braithe","Taewen","Larke","Silene","Phressa","Esther","Anika","Rasy ","Harper","Indie","Vita","Drusila","Minha","Surane","Lassona","Merula","Kye","Jonna","Lyla","Zet","Orett","Naphtalia","Turi","Rhays","Shike","Hartie","Beela","Leska","Vemery ","Lunex","Fidess","Tisette","Partha"],R=n(24),P=n.n(R),C=function(e,t,n){return Math.min(Math.max(e,t),n)};function E(e,t,n){var a=new g.Chance(n);return Object(o.a)(Array(e).keys()).map((function(e){return Object(o.a)(Array(t).keys()).map((function(e){return a.floating({min:0,max:1,fixed:2})}))}))}var H=function(e,t,n){return e.map((function(e,a){return a===t?Object(s.a)(Object(s.a)({},e),{},{stats:Object(s.a)(Object(s.a)({},e.stats),n(e.stats))}):e}))},L=function(e){return Object.values(e.build).flatMap((function(e){return e.effects}))},J={attackMonster:function(e,t,n){return Object(s.a)(Object(s.a)({},t),{},{enemies:H(t.enemies,t.target,(function(a){var r=a.hp;return{hp:C(r-n,0,e.enemies[t.target].stats.hp)}}))})},changeDistance:function(e,t,n){return Object(s.a)(Object(s.a)({},e),{},{enemies:H(e.enemies,t,(function(e){var t=e.distance;return{distance:C(t+n,1,5)}}))})},attackPlayer:function(e,t,n){return Object(s.a)(Object(s.a)({},t),{},{player:Object(s.a)(Object(s.a)({},t.player),{},{stats:Object(s.a)(Object(s.a)({},t.player.stats),{},{hp:C(t.player.stats.hp-n,0,e.player.stats.hp)})})})},modifyPlayerStamina:function(e,t,n){return Object(s.a)(Object(s.a)({},t),{},{player:Object(s.a)(Object(s.a)({},t.player),{},{stats:Object(s.a)(Object(s.a)({},t.player.stats),{},{stamina:C(t.player.stats.stamina+n,0,e.player.stats.stamina)})})})}};function z(e,t,n,a){var r=arguments.length>4&&void 0!==arguments[4]?arguments[4]:20;return{states:[{player:e,enemies:t,target:0,lastAttacks:[]}],rng:E(n,r,a),turns:n,id:P()(z)}}var D=function(e,t){var n=k(e),a=n.enemies,r=n.player,i=L(r)[t],c=function(e,t){return function(n,a){var r=Object(o.a)(e.rng[t]);return Math.floor((a-n)*r.pop()+n)}}(e,e.states.length-1),l=Object(h.a)(a).map((function(e,t){return[t,e.effects[e.rolls[e.stats.distance-1][c(0,e.rolls[e.stats.distance-1].length)]]]})).concat([["Player",i]]).sortBy((function(e){var t=Object(u.a)(e,2);t[0];return t[1].priority})),f=J.modifyPlayerStamina(e.states[0],k(e),r.stats.staminaPerTurn-i.stamina),d=l.reduce((function(t,n){var a,r=Object(u.a)(n,2),i=r[0],c=r[1],s=Object(u.a)(t,2),l=s[0],d=s[1],p="Player"===i?f.target:i;return new Set(Object(o.a)(c.range)).has(null===(a=f.enemies[p])||void 0===a?void 0:a.stats.distance)?[A[c.effect](i,e,l),[].concat(Object(o.a)(d),[[i,c.display]])]:[l,[].concat(Object(o.a)(d),[[i,"".concat(c.display," \u274c\u274cWHIFF\u274c\u274c")]])]}),[f,[]]),p=Object(u.a)(d,2),j=p[0],b=p[1];return j.lastAttacks=b,Object(s.a)(Object(s.a)({},e),{},{states:[].concat(Object(o.a)(e.states),[j])})},N=function(e,t){return e.states[e.states.length-1].target=t,Object(s.a)(Object(s.a)({},e),{},{states:Object(o.a)(e.states)})},W=function(e){var t,n=e.handlePlayerEffect,r=e.setSelected,i=e.game,c=e.solveGame,s=e.undo,O=e.redo,g=e.hint,v=k(i),x=v.player,w=v.enemies,S=v.target,A=v.lastAttacks,B=L(x),F=w.reduce((function(e,t){return t.stats.hp+e}),0),M=x.stats.hp>0,T=F>0,R=i.states.length<=i.turns,P=M&&T&&R,C=function(e){var t=Object(a.useState)(new Set),n=Object(u.a)(t,2),r=n[0],i=n[1],c=function(e){var t=e.key;i((function(e){return new Set([].concat(Object(o.a)(e),[t]))}))},s=Object(a.useCallback)((function(t){var n=t.key;i((function(e){return new Set(Object(o.a)(e).filter((function(e){return e!==n})))})),e(n)}),[e]);return Object(a.useEffect)((function(){return window.addEventListener("keydown",c),window.addEventListener("keyup",s),function(){window.removeEventListener("keydown",c),window.removeEventListener("keyup",s)}}),[s]),r}((function(e){if(P){var t=parseInt(e);if(t>0&&t<=B.length){if(!(B[t-1].stamina<=x.stats.stamina))return;n(t-1)}}})),E=new Set(Object(o.a)(C).flatMap((function(e){var t=parseInt(e);return t>0&&t<=B.length?[B[t-1].display]:[]})));return Object(b.jsx)(l.a,{fluid:!0,children:Object(b.jsx)(f.a,{className:"justify-content-center align-items-flex-start",children:Object(b.jsxs)(d.a,{sm:12,md:8,children:[Object(b.jsx)(f.a,{children:Object(b.jsxs)(p.a.Title,{children:["Turn ",i.states.length," out of ",i.turns," ",M?T?"":Object(b.jsx)("b",{children:"\ud83c\udf89\ud83c\udf89VICTORY\ud83c\udf89\ud83c\udf89"}):Object(b.jsx)("b",{children:"\u274c\u274cDEFEAT\u274c\u274c"})]})}),Object(b.jsx)(f.a,{children:Object(b.jsx)(d.a,{children:Object(b.jsx)(y,{player:x,onClickEffect:n,selectedButtons:E,lastAction:(null!==(t=A.find((function(e){return"Player"===e[0]})))&&void 0!==t?t:[void 0,void 0])[1],canAct:P})})}),Object(b.jsx)(f.a,{className:"mt-2 g-2",children:w.map((function(e,t){return Object(b.jsx)(d.a,{xs:6,md:4,children:Object(b.jsx)(m,{enemy:e,canAct:P,latestAttack:Object(h.a)(A).filter((function(e){var n=Object(u.a)(e,2),a=n[0];n[1];return a===t})).map((function(e){return e[1]})).first(),isSelected:t===S,onSelect:function(){return r(t)}},t)},t)}))}),Object(b.jsxs)(f.a,{children:[i.states.length>1&&Object(b.jsx)(j.a,{onClick:function(e){return s()},children:"Undo \u21a9"}),O&&Object(b.jsx)(j.a,{onClick:function(e){return O()},children:"Redo \u21aa"}),Object(b.jsx)(j.a,{onClick:function(e){return g(100)},children:"Hint"}),Object(b.jsx)(j.a,{onClick:function(e){return c(100)},children:"Solve \u231b"}),Object(b.jsx)(j.a,{onClick:function(e){return c(1e3)},children:"Solve thoroughly \u231b\u231b\u231b"})]})]})})})},G=n(8),K=n(68),I=n(67),V=n(66);var Y=Object.entries(B).map((function(e){var t=Object(u.a)(e,2);return{type:t[0],options:t[1].map((function(e,t){return{display:e.display,value:t}}))}})),Z=function(e){var t=e.isSelected,n=e.section,r=e.options,i=e.setField,c=function(e){var t=Object(a.useRef)(null);return[function(){return t.current.scrollIntoView(e)},t]}({behavior:"smooth",block:"start"}),s=Object(u.a)(c,2),o=s[0],l=s[1];return Object(b.jsxs)(f.a,{children:[Object(b.jsx)(K.a.Label,{children:n}),Object(b.jsx)("br",{}),Object(b.jsx)(V.a,{size:"lg",className:"mb-2",children:r.map((function(e){var a=e.display,r=e.value;return Object(b.jsx)(j.a,{name:n,id:"".concat(r),variant:t(r)?"primary":"secondary",onClick:function(){i(r),o()},children:a},r)}))}),Object(b.jsx)("div",{id:"".concat(n,"-scroll"),ref:l})]})},U=function(e){var t=e.onSave,n=r.a.useState(Y.reduce((function(e,t){var n=t.type,a=t.options;return Object(s.a)(Object(s.a)({},e),{},Object(G.a)({},n,a[0].value))}),{})),a=Object(u.a)(n,2),i=a[0],c=a[1],o=r.a.useState({name:F(),age:(new v.a).age()}),d=Object(u.a)(o,2),p=d[0],h=d[1],m=function(e){return Object(b.jsx)("b",{children:B[e][i[e]].display})};return Object(b.jsx)(K.a,{onSubmit:function(e){e.preventDefault(),t({id:"p-1",lore:p,stats:{hp:25,stamina:8,staminaPerTurn:2},build:Object.entries(i).reduce((function(e,t){var n=Object(u.a)(t,2),a=n[0],r=n[1];return Object(s.a)(Object(s.a)({},e),{},Object(G.a)({},a,B[a][r]))}),{basic:B.basic[0]})})},children:Object(b.jsxs)(l.a,{fluid:!0,style:{marginBottom:"105px"},children:[Object(b.jsx)(f.a,{className:"g-2",children:Y.map((function(e){var t=e.type,n=e.options;return Object(b.jsx)(Z,{setField:function(e){return function(e,t){c(Object(s.a)(Object(s.a)({},i),{},Object(G.a)({},e,t)))}(t,e)},section:t,options:n,isSelected:function(e){return i[t]===e}},t)}))}),Object(b.jsx)(I.a,{fixed:"bottom",bg:"dark",variant:"dark",style:{maxHeight:"100px"},children:Object(b.jsxs)(l.a,{children:[Object(b.jsxs)(I.a.Text,{children:["You are ",Object(b.jsx)("i",{onClick:function(){return h((function(e){return Object(s.a)(Object(s.a)({},e),{},{name:F()})}))},children:p.name}),", the ",m("skill")," ",m("class")," ",m("charm"),Object(b.jsx)("br",{}),"who wields a ",m("weapon")," and a ",m("offhand"),Object(b.jsx)("br",{}),"and wears ",m("armor")," with ",m("headgear")," and ",m("footwear")]}),Object(b.jsx)(j.a,{type:"submit",children:"Pick your foe!"})]})})]})})},q=function(e){var t=e.player,n=e.onSave,a=r.a.useState([]),i=Object(u.a)(a,2),c=i[0],s=i[1],f=function(e){return Object(b.jsx)("b",{children:t.build[e].display})};return Object(b.jsxs)(K.a,{onSubmit:function(e){e.preventDefault(),n(Object(o.a)(c))},children:[Object(b.jsx)(l.a,{fluid:!0,style:{marginBottom:c.length>0?"205px":"105px"},children:Object(b.jsx)(V.a,{size:"lg",className:"mb-2",children:M.map((function(e){return Object(b.jsx)(j.a,{disabled:c.length>4,onClick:function(){return s((function(t){return[].concat(Object(o.a)(t),[e])}))},children:e.lore.name},e.lore.name)}))})}),c.length>0&&Object(b.jsx)(I.a,{fixed:"bottom",bg:"dark",variant:"dark",style:{marginBottom:"100px"},children:Object(b.jsx)(l.a,{fluid:!0,children:Object(b.jsx)(V.a,{size:"sm",className:"mb-2",children:c.map((function(e,t){return Object(b.jsx)(j.a,{onClick:function(){return s((function(t){var n=!1;return t.filter((function(t){return n||t.lore.name!==e.lore.name||!(n=!0)}))}))},children:e.lore.name},"".concat(e.lore.name,"-").concat(t))}))})})}),Object(b.jsx)(I.a,{fixed:"bottom",bg:"dark",variant:"dark",style:{maxHeight:"100px"},children:Object(b.jsxs)(l.a,{children:[Object(b.jsxs)(I.a.Text,{children:["You are ",Object(b.jsx)("i",{children:t.lore.name}),", the ",f("skill")," ",f("class")," ",f("charm"),Object(b.jsx)("br",{}),"who wields a ",f("weapon")," and a ",f("offhand"),Object(b.jsx)("br",{}),"and wears ",f("armor")," with ",f("headgear")," and ",f("footwear")]}),Object(b.jsxs)(V.a,{children:[Object(b.jsx)(j.a,{disabled:c.length<0||c.length>5,onClick:function(e){return s((function(e){return[].concat(Object(o.a)(e),[(new g.Chance).pickone(M)])}))},children:"Add Random"}),Object(b.jsx)(j.a,{type:"submit",disabled:c.length<1||c.length>5,children:"To Battle!"})]})]})})]})};function Q(e){function t(e,t){if((e=e||{}).mutationFunction=e.mutationFunction||t.mutationFunction,e.crossoverFunction=e.crossoverFunction||t.crossoverFunction,e.fitnessFunction=e.fitnessFunction||t.fitnessFunction,e.doesABeatBFunction=e.doesABeatBFunction||t.doesABeatBFunction,e.population=e.population||t.population,e.population.length<=0)throw Error("population must be an array and contain at least 1 phenotypes");if(e.populationSize=e.populationSize||t.populationSize,e.populationSize<=0)throw Error("populationSize must be greater than 0");return e}var n=t(e,{mutationFunction:function(e){return e},crossoverFunction:function(e,t){return[e,t]},fitnessFunction:function(e){return 0},doesABeatBFunction:void 0,population:[],populationSize:100});function a(e){return JSON.parse(JSON.stringify(e))}function r(e){return n.mutationFunction(a(e))}function i(e){e=a(e);var t=n.population[Math.floor(Math.random()*n.population.length)];return t=a(t),n.crossoverFunction(e,t)[0]}return{evolve:function(e){return e&&(n=t(e,n)),function(){for(var e=n.population.length;n.population.length<n.populationSize;){var t=Math.floor(Math.random()*e);n.population.push(r(a(n.population[Math.floor(t)])))}}(),function(){for(var e=0;e<n.population.length;e++){var t=Math.floor(Math.random()*n.population.length),a=n.population[t];n.population[t]=n.population[e],n.population[e]=a}}(),function(){for(var e,t,a=[],c=0;c<n.population.length-1;c+=2){var s=n.population[c],o=n.population[c+1];a.push(s),e=s,t=o,(n.doesABeatBFunction?n.doesABeatBFunction(e,t):n.fitnessFunction(e)>=n.fitnessFunction(t))?Math.random()<.5?a.push(r(s)):a.push(i(s)):a.push(o)}n.population=a}(),this},best:function(){var e=this.scoredPopulation();return a(e.reduce((function(e,t){return e.score>=t.score?e:t}),e[0]).phenotype)},bestScore:function(){return n.fitnessFunction(this.best())},population:function(){return a(this.config().population)},scoredPopulation:function(){return this.population().map((function(e){return{phenotype:a(e),score:n.fitnessFunction(e)}}))},config:function(){return a(n)},clone:function(e){return Q(t(e,t(this.config(),n)))}}}n(29);var X={playerSeed:"Miau",weights:{monster:.7,player:.125,turn:.05,stamina:.075},debug:!1};function $(e,t,n){for(var a=Object(s.a)(Object(s.a)({},X),n),r=Object(o.a)(Array(t).keys()),i=new v.a(a.playerSeed),c={mutationFunction:function(e){var t=k(e),n=t.enemies.reduce((function(e,t){return e+t.stats.hp}),0);if(0===t.player.stats.hp||0===n)return e;for(var a=e;6===i.d6()||(null!==(r=null===(c=k(a).enemies[k(a).target])||void 0===c?void 0:c.stats.hp)&&void 0!==r?r:0)<=0;){var r,c;a=N(a,i.natural({min:0,max:k(a).enemies.length-1}))}var s=k(a),o=L(s.player),l=o.map((function(e,t){return[e,t]})).filter((function(e){var t=Object(u.a)(e,2),n=t[0];t[1];return n.stamina>s.player.stats.stamina})).map((function(e){var t=Object(u.a)(e,2);t[0];return t[1]}));return a=D(a,i.natural({min:0,max:o.length-1,exclude:l}))},fitnessFunction:function(e){var t=k(e),n=t.enemies.reduce((function(e,t){return e+t.stats.hp}),0),r=t.player.stats.hp,i=t.player.stats.stamina,c=e.states[0].player.stats.hp,s=e.states[0].player.stats.hp,o=e.states[0].enemies.reduce((function(e,t){return e+t.stats.hp}),0),u=(o-n)/o,l=r/c,f=(e.turns-e.states.length)/e.turns,d=i/s,p=u*a.weights.monster+l*a.weights.player+f*a.weights.turn+d*a.weights.stamina;return a.debug&&console.log("MH: ".concat(n," | PH: ").concat(r," | TR: ").concat(e.states.length,"\nFitness: ").concat(p," | MF: ").concat(u," | PF: ").concat(l," | SF: ").concat(d," | TF: ").concat(f,"\nWeights: ").concat(JSON.stringify(a.weights))),p},population:r.map((function(t){return e})),populationSize:t},l=(null===n||void 0===n?void 0:n.turns)?null===n||void 0===n?void 0:n.turns:e.turns,f=new Q(c),d=0;d<l;d++)f=f.evolve();return f.scoredPopulation()}var _=function(){var e=r.a.useState("buildPlayer"),t=Object(u.a)(e,2),n=t[0],a=t[1],i=r.a.useState(),c=Object(u.a)(i,2),l=c[0],f=c[1],d=r.a.useState(),p=Object(u.a)(d,2),j=p[0],m=p[1],O=r.a.useState(),y=Object(u.a)(O,2),g=y[0],v=y[1],x=r.a.useState([]),w=Object(u.a)(x,2),S=w[0],A=w[1];if(!g&&l&&j){var B=z(l,j,50,"PACC");v(B)}return Object(b.jsxs)("div",{className:"App",children:["buildPlayer"===n?Object(b.jsx)(U,{onSave:function(e){f(e),a("buildEncounter")}}):null,"buildEncounter"===n&&l?Object(b.jsx)(q,{player:l,onSave:function(e){m(e),a("game")}}):null,"game"===n&&g?Object(b.jsx)(W,{game:g,redo:S.length>0?function(){var e=Object(o.a)(S),t=e.pop();A(e),v(Object(s.a)(Object(s.a)({},g),{},{states:[].concat(Object(o.a)(g.states),[t])}))}:void 0,undo:function(){A([].concat(Object(o.a)(S),[k(g)])),v(Object(s.a)(Object(s.a)({},g),{},{states:[g.states[0]].concat(Object(o.a)(g.states.slice(1,-1)))}))},setSelected:function(e){A([]),v(N(g,e))},handlePlayerEffect:function(e){A([]),v(D(g,e))},solveGame:function(e){return v(Object(h.a)($(g,e,{turns:g.turns-g.states.length})).maxBy((function(e){return e.score})).phenotype)},hint:function(e){return v(Object(s.a)(Object(s.a)({},g),{},{states:[].concat(Object(o.a)(g.states),[Object(h.a)($(g,e,{turns:g.turns-g.states.length})).maxBy((function(e){return e.score})).phenotype.states[g.states.length]])}))}}):null]})},ee=Boolean("localhost"===window.location.hostname||"[::1]"===window.location.hostname||window.location.hostname.match(/^127(?:\.(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)){3}$/));function te(e,t){navigator.serviceWorker.register(e).then((function(e){e.onupdatefound=function(){var n=e.installing;null!=n&&(n.onstatechange=function(){"installed"===n.state&&(navigator.serviceWorker.controller?(console.log("New content is available and will be used when all tabs for this page are closed. See https://cra.link/PWA."),t&&t.onUpdate&&t.onUpdate(e)):(console.log("Content is cached for offline use."),t&&t.onSuccess&&t.onSuccess(e)))})}})).catch((function(e){console.error("Error during service worker registration:",e)}))}var ne=function(e){e&&e instanceof Function&&n.e(3).then(n.bind(null,72)).then((function(t){var n=t.getCLS,a=t.getFID,r=t.getFCP,i=t.getLCP,c=t.getTTFB;n(e),a(e),r(e),i(e),c(e)}))};c.a.render(Object(b.jsx)(r.a.StrictMode,{children:Object(b.jsx)(_,{})}),document.getElementById("root")),function(e){if("serviceWorker"in navigator){if(new URL("/buildmancer",window.location.href).origin!==window.location.origin)return;window.addEventListener("load",(function(){var t="".concat("/buildmancer","/service-worker.js");ee?(!function(e,t){fetch(e,{headers:{"Service-Worker":"script"}}).then((function(n){var a=n.headers.get("content-type");404===n.status||null!=a&&-1===a.indexOf("javascript")?navigator.serviceWorker.ready.then((function(e){e.unregister().then((function(){window.location.reload()}))})):te(e,t)})).catch((function(){console.log("No internet connection found. App is running in offline mode.")}))}(t,e),navigator.serviceWorker.ready.then((function(){console.log("This web app is being served cache-first by a service worker. To learn more, visit https://cra.link/PWA")}))):te(t,e)}))}}(),ne()}},[[62,1,2]]]);
//# sourceMappingURL=main.ebfe442e.chunk.js.map