$(document).ready(function () {

    const getRow = (obj) => {
        const reducer = (acc, red) => acc + `<td>${obj[red]}</td>`;
        var toAppend = Object.keys(obj).reduce(reducer , '')
        return `<tr data-href="${obj.url}" style="cursor: pointer;">${toAppend}</tr>`;
    }

    const onApiData = (data) => {
        const input = JSON.parse(data);
        const listings = input.listings.map(listing => {
            return {
                booliId: listing.booliId,
                adress: listing.location.address.streetAddress,
                type: listing.objectType,
                price: listing.listPrice + ' kr',
                livingArea: listing.rooms + ' rum , ' + listing.livingArea + ' m2',
                ppsqm:  Math.ceil( +listing.listPrice / +listing.livingArea ) + ' kr/m2',
                rent: listing.rent + ' kr',
                url: listing.url
            };
        });
        console.log(listings);
        listings.forEach(appendRow);
    }

    const appendRow = (data) => {
        var toAppend = getRow(data);
        $('#dataTable > tbody:last-child').append(toAppend);
    }
    
    const search = $('#search');
    const searchBar = $('#searchBar');
    const table = $('#dataTable');
    const login = $('#login');
    const signup = $('#signup');
    const modal = $('#modalLRForm');
    const h3 = $('#welcome');

    var userHolder = [];
    
    modal.modal('show');

    search.on('click', () => {
        [q, minLivingArea, maxLivingArea] = searchBar
            .find('input') 
            .toArray()
            .map(el => el.value);
        const callerId = $(document).find('h3').html().split(', ')[1];

        $.ajax({
            url: `/api/${callerId}/${q}/${minLivingArea}/${maxLivingArea}`,
            type: 'GET',
            contentType: 'application/json',
            success: onApiData,
            error: function (err) { console.error(err) }
        });
    });

    login.on('click', () => {
        const input = $('#modalLRInput10')[0].value;
        if (input === '') return;
        $.ajax({
            url: '/users/' + input,
            type: 'GET',
            contentType: 'application/json',
            success: function (data) {
                if(data) {
                    userHolder.push(data);
                    modal.modal('hide');
                    searchBar.removeAttr('hidden');
                    table.removeAttr('hidden');
                    h3.html('<h3>Welcome, ' + input + '</h3>');
                } else {
                    $('#modalLRInput10')[0].value = 'Invalid user';
                }
            },
            error: function (err) { console.error(err) }
        });
    });

    signup.on('click', () => {
        const callerId = $('#modalLRInput12')[0].value;
        const apiKey = $('#modalLRInput13')[0].value;

        $.ajax({
            url: '/users/' + callerId + '/' + apiKey,
            type: 'POST',
            contentType: 'application/json',
            success: function (data) {
                var res = JSON.parse(data);
                if (res.status === "ok") {
                    modal.modal('hide');
                    searchBar.removeAttr('hidden');
                    table.removeAttr('hidden');
                    h3.html('<h3>Welcome, ' + callerId + '</h3>');
                }  
            },
            error: function (err) { console.error(err) }
        });
    });

    table.on('click', 'tr', (ev) => {
        ev.preventDefault();
        var row = $(ev.currentTarget);
        row.addClass('bg-success');
        
        const callerId = $(document).find('h3').html().split(', ')[1];
        var rowData = row.find('td').toArray()
            .map(td => $(td).text());
        var listingId = rowData[0];
        var [q, minLivingArea, maxLivingArea] = searchBar
            .find('input') 
            .toArray()
            .map(el => el.value);
        
        $.ajax({
            url: `/listings/${callerId}/${listingId}/${q}/${minLivingArea}/${maxLivingArea}`,
            type: 'POST',
            contentType: 'application/json',
            success: function (data) {
                var res = JSON.parse(data);
                if (res.status === "ok") {
                    console.log("saved");;
                    window.location.href = row.data('href');
                }  
            },
            error: function (err) { console.error(err) }
        });
    });

})