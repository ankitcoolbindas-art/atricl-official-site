/* ATRICL blog share bar: no third-party scripts. Uses canonical URL + page title. */
(function(){
  var canon=document.querySelector('link[rel="canonical"]');
  var url=canon?canon.href:location.href.split('#')[0];
  var h1=document.querySelector('h1');
  var title=(h1&&h1.textContent.trim())||document.title;
  var hi=(document.documentElement.lang||'').indexOf('hi')===0;
  var L=hi?{share:'शेयर करें',copy:'लिंक कॉपी करें',copied:'कॉपी हो गया',on:' पर शेयर करें'}:{share:'Share',copy:'Copy link',copied:'Copied',on:'Share on '};
  var e=encodeURIComponent, u=e(url), t=e(title);
  var I={
   wa:'<path d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2zm0 18.2c-1.5 0-3-.4-4.3-1.2l-.3-.2-3 .8.8-2.9-.2-.3A8.2 8.2 0 1 1 12 20.2zm4.5-6.1c-.2-.1-1.5-.7-1.7-.8s-.4-.1-.6.1-.7.8-.8 1-.3.2-.5.1a6.7 6.7 0 0 1-3.3-2.9c-.3-.4.3-.4.7-1.3.1-.2 0-.3 0-.4l-.8-1.8c-.2-.5-.4-.4-.6-.4h-.5a1 1 0 0 0-.7.3 3 3 0 0 0-.9 2.2 5.2 5.2 0 0 0 1.1 2.7 11.8 11.8 0 0 0 4.5 4c1.7.7 2.3.8 3.2.6.5-.1 1.5-.6 1.7-1.2s.2-1.1.1-1.2l-.4-.2z"/>',
   fb:'<path d="M14 8h3V4h-3a4 4 0 0 0-4 4v2H8v4h2v8h4v-8h3l1-4h-4V8.5c0-.3.2-.5.5-.5z"/>',
   li:'<path d="M4.98 3.5A2.5 2.5 0 1 1 5 8.5a2.5 2.5 0 0 1 0-5zM3 9.5h4V21H3zM9.5 9.5h3.8v1.6h.1c.5-1 1.8-2 3.8-2 4 0 4.8 2.6 4.8 6V21h-4v-5.2c0-1.2 0-2.9-1.8-2.9s-2 1.4-2 2.8V21h-4z"/>',
   x:'<path d="M17.8 3h3.1l-6.8 7.8 8 10.2h-6.3l-4.9-6.4L5.3 21H2.2l7.3-8.3L1.8 3h6.4l4.4 5.8zm-1.1 16.2h1.7L7.4 4.7H5.6z"/>',
   tg:'<path d="M21.9 4.3 18.8 19c-.2 1-.8 1.3-1.7.8l-4.6-3.4-2.2 2.1c-.3.3-.5.5-1 .5l.3-4.7 8.6-7.8c.4-.3-.1-.5-.6-.2L7 13l-4.6-1.4c-1-.3-1-1 .2-1.5l17.9-6.9c.8-.3 1.6.2 1.4 1.1z"/>',
   cp:'<path d="M16 1H4a2 2 0 0 0-2 2v14h2V3h12zm3 4H8a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h11a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2zm0 16H8V7h11z"/>',
   sh:'<path d="M18 16a3 3 0 0 0-2.4 1.2l-6.7-3.4a3 3 0 0 0 0-1.6l6.7-3.4A3 3 0 1 0 15 7l-6.7 3.4a3 3 0 1 0 0 3.2L15 17a3 3 0 1 0 3-1z"/>'};
  function svg(k){return '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">'+I[k]+'</svg>';}
  var nets=[['whatsapp','WhatsApp','wa','https://wa.me/?text='+t+'%20'+u],
   ['facebook','Facebook','fb','https://www.facebook.com/sharer/sharer.php?u='+u],
   ['linkedin','LinkedIn','li','https://www.linkedin.com/sharing/share-offsite/?url='+u],
   ['x','X','x','https://twitter.com/intent/tweet?text='+t+'&url='+u],
   ['telegram','Telegram','tg','https://t.me/share/url?url='+u+'&text='+t]];
  function track(m){if(typeof window.gtag==='function'){try{gtag('event','share',{method:m,content_type:'article',item_id:url});}catch(_){}}}
  function aria(n){return hi?n+L.on:L.on+n;}
  document.querySelectorAll('[data-atricl-share]').forEach(function(box){
    box.classList.add('atricl-share'); box.setAttribute('role','group'); box.setAttribute('aria-label',L.share);
    var h='<span class="atricl-share__label">'+L.share+'</span>';
    h+='<button type="button" class="atricl-share__btn" data-act="native" hidden aria-label="'+L.share+'">'+svg('sh')+'<span class="atricl-share__txt">'+L.share+'</span></button>';
    nets.forEach(function(n){h+='<a class="atricl-share__btn" href="'+n[3]+'" target="_blank" rel="noopener noreferrer" data-m="'+n[0]+'" aria-label="'+aria(n[1])+'" title="'+n[1]+'">'+svg(n[2])+'</a>';});
    h+='<button type="button" class="atricl-share__btn" data-act="copy" aria-label="'+L.copy+'">'+svg('cp')+'<span class="atricl-share__txt">'+L.copy+'</span></button><span class="atricl-share__sr" aria-live="polite"></span>';
    box.innerHTML=h;
    var nat=box.querySelector('[data-act="native"]');
    if(navigator.share){nat.hidden=false;nat.addEventListener('click',function(){navigator.share({title:title,url:url}).then(function(){track('native');}).catch(function(){});});}
    box.querySelectorAll('a[data-m]').forEach(function(a){a.addEventListener('click',function(){track(a.getAttribute('data-m'));});});
    var cb=box.querySelector('[data-act="copy"]'),txt=cb.querySelector('.atricl-share__txt'),live=box.querySelector('.atricl-share__sr');
    function done(){txt.textContent=L.copied;live.textContent=L.copied;cb.setAttribute('aria-label',L.copied);track('copy_link');setTimeout(function(){txt.textContent=L.copy;live.textContent='';cb.setAttribute('aria-label',L.copy);},2000);}
    cb.addEventListener('click',function(){
      if(navigator.clipboard&&window.isSecureContext){navigator.clipboard.writeText(url).then(done,fallback);}else fallback();
      function fallback(){var ta=document.createElement('textarea');ta.value=url;ta.setAttribute('readonly','');ta.style.position='fixed';ta.style.opacity='0';document.body.appendChild(ta);ta.select();try{document.execCommand('copy');done();}catch(_){}document.body.removeChild(ta);}
    });
  });
})();
