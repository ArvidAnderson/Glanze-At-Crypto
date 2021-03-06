//Importing neccesary modules for the database
const Store = require('electron-store');
const { data } = require('jquery');
const { watch } = require('original-fs');
const Sortable = require('sortablejs');
const store = new Store();


//Makes sure watchlist_order always is on the top of the database
function watchlist_order_exists() {
    if (store.has('watchlist_order')) {
        //Do nothing
    } else {
        store.set('watchlist_order', 'empty')
    }    
}

// Rendering on launch - Also looping though the database to gather the information to render, function located below
renderWatchlist();
//Initate the sortable
var el = document.getElementById('items');
var sortable = Sortable.create(el, {
    animation: 600,
    dataIdAttr: 'data-id',
    group: 'watchlist_order',
    store: {
            /**
             * Get the order of elements. Called once during initialization.
             * @param   {Sortable}  sortable
             * @returns {Array}
             */
            get: function (sortable) {
                var order = store.get(sortable.options.group.name);
                return order ? order.split('|') : [];
            },
            /**
             * Save the order of elements. Called onEnd (when the item is dropped).
             * @param {Sortable} sortable
             */
            set: function (sortable) {
                var order = sortable.toArray();
                console.log(order)
                store.set(sortable.options.group.name, order.join('|'));
            }
    }
});


//Runs watchlist_order_exists
watchlist_order_exists();

//This function grabs information from the database, call it to render
function renderWatchlist() {
    ul.className = 'no-collection-border collection';
    ul.id = 'items';
    database_object = store.get();
    for (const i in database_object) {
        if (i == 'watchlist_order') {
            //Do nothing
        } else {
            const symbol = i;
            const name = store.get(`${i}.name`)
            const li = document.createElement('li');
            li.className = 'custom-li collection-item';
            li.setAttribute('data-id', `${symbol}`)
            callAPI('USD', symbol).then(result => {
            li.innerHTML = `
            <div class='row crypto-in-watchlist'>
                <div class="col s6">
                    <h4>${name}</h4><h5 class="${symbol}">$${result}</h5>
                </div>
                <div class="col s6">
                    <img class="right" src="assets/cryptoicons/white/${symbol}.png" alt="">
                </div> 
            </div>`
            })
            ul.appendChild(li);
    };  }
}

//Catch add crypto - On add
ipcRenderer.on('crypto:add', function(e, symbol, name){
    if (symbol in store.get()) {
        function yesWindow(){
            ipcRenderer.send('alertWindow:open');
        };
        yesWindow();
    } else {
        ul.className = 'no-collection-border collection';
        const li = document.createElement('li');
        li.className = 'custom-li collection-item';
        li.setAttribute('data-id', `${symbol}`)
        //Adding the price using the API from crypto_api_js
        callAPI('USD', symbol).then(result => {
            li.innerHTML = (`
            <div class='row crypto-in-watchlist'>
                <div class="col s6">
                    <h4>${name}</h4><h5>$${result}</h5>
                </div>
                <div class="col s6">
                    <img class="right" src="assets/cryptoicons/white/${symbol}.png" alt="">
                </div> 
            </div>`);
            appendtoDatabase(name, symbol);
        });
        ul.prepend(li),
        order = store.get(sortable.options.group.name);
        order ? order.split('|') : [];
        order = sortable.toArray();
        store.set(sortable.options.group.name, order.join('|'));
    }
});

//Add to the database
function appendtoDatabase(name, symbol) {
    store.set(symbol, {name: name, img: symbol
    });
}

//Clear the watchlist
ipcRenderer.on('watchlist:clear', function(){
    //Clears the database
    store.clear();
    ul.innerHTML = '';
    watchlist_order_exists();
});

//Auto updating every 40000 ms
setInterval(function(){ reloadWatchlist(); }, 40000);

//Reload watchlist Function
function reloadWatchlist() {
    for (const i in database_object) {
        const symbol = i;
        if (i == 'watchlist_order') {
            //Do nothing
        } else {
            callAPI('USD', symbol).then(result => {
                console.log(result)
                document.getElementsByClassName(`${symbol}`)[0].innerHTML = `$${result}`;
            });
    }};
}
//Catch reload watchlist
ipcRenderer.on('watchlist:reload', function(){
    reloadWatchlist();
});

//Remove item on dbl click
ul.addEventListener('dblclick', function(e) {
    const li = e.target.closest('li');
    const data_id = li.getAttribute('data-id')
    li.parentElement.removeChild(li);
    //Removing the crypto from the watchlist in database
    store.delete(data_id);
    order = store.get(sortable.options.group.name);
    order ? order.split('|') : [];
    order = sortable.toArray();
    store.set(sortable.options.group.name, order.join('|'));
})
