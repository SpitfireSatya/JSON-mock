
//debugger;



chrome.devtools.panels.create("Mock Json",
    "icon.png",
    "panel.html",
    function(panel) {
    	var dataEntries = [];
      var selectedRequests = [];
      var panelWinObj;
      var methods = [];
      var finalData = [];
      var requiredFields = [];
      panel.onShown.addListener(function(panel_window){
        panelWinObj = panel_window;

        var _methods = panelWinObj.document.getElementsByClassName('menu1-inner');
        requiredFields = panelWinObj.document.getElementsByClassName('menu2-inner');
        for(var i=0; i<_methods.length; i++) {
          if(_methods[i].checked == true) {
            methods.push(_methods[i].value);
          }
        }

        var updateButton = panelWinObj.document.getElementById('updateSelection');

        updateButton.addEventListener('click', function(){
          _methods = panelWinObj.document.getElementsByClassName('menu1-inner');
          methods = [];
          for(var i=0; i<_methods.length; i++) {
            if(_methods[i].checked == true) {
              methods.push(_methods[i].value);
            }
          }
          requiredFields = panelWinObj.document.getElementsByClassName('menu2-inner');
          bindData();
        });

        //call to getHAR to list network tab entries when panel is loaded
        chrome.devtools.network.getHAR(function(result) {
          dataEntries = [];
          dataEntries = dataEntries.concat(result.entries);
          bindData();
        });

        //call to onRequestFinished  to list new network entries when panel is already loaded
        chrome.devtools.network.onRequestFinished.addListener( function(request) {
            dataEntries.push(request); 
            bindData();
        });

        function bindData(){ 
          var tableElem  = document.createElement('table');
          tableElem.id = 'dataTable';
          selectedRequests = [];
          for(i=0; i<dataEntries.length;i++){
            if(methods.indexOf(dataEntries[i].request.method)>-1) {
              var rowElem = document.createElement('tr');
              var colElem = document.createElement('td');
              colElem.appendChild(document.createTextNode(dataEntries[i].request.method)); //to print cell number
              rowElem.appendChild(colElem);

              colElem = document.createElement('td');
              colElem.appendChild(document.createTextNode(dataEntries[i].request.url)); //to print cell number
              rowElem.appendChild(colElem);

              tableElem .appendChild(rowElem);
              selectedRequests.push(dataEntries[i]);
            }
          }
          if(panelWinObj.document.getElementById('dataTable')){
            panelWinObj.document.getElementById('dataTable').remove();
          }
          panelWinObj.document.getElementById('mockDataTable').appendChild(tableElem);
          panelWinObj.document.getElementById('selectedItems').innerHTML = selectedRequests.length + ' requests selected';
        }


        //code for donload button
        var downloadMockJsonButton  = panelWinObj.document.getElementById('downloadJson');
        
        downloadMockJsonButton.addEventListener('click', function tmp() {
          var download = false;
          var promiseArray = [];
          var finalDataObject = {};
          finalData = [];
          for(i=0; i<selectedRequests.length;i++){

            var promiseObj = new Promise(
            // The resolver function is called with the ability to resolve or
            // reject the promise
            function(resolve, reject) {
                selectedRequests[i].getContent( function(body){
                    //console.log('xyz:',JSON.parse(body) );
                    resolve(body);
                });
            });
            promiseArray.push(promiseObj);
          }
          Promise.all(promiseArray).then(values => { 
            for(i=0; i<selectedRequests.length; i++){
              finalDataObject = {};
              finalDataObject.url = requiredFields[0].checked ? selectedRequests[i].request.url : undefined;
              finalDataObject.method = requiredFields[1].checked ? selectedRequests[i].request.method : undefined;
              finalDataObject.body = requiredFields[2].checked ? selectedRequests[i].request.body : undefined;
              finalDataObject.requestHeaders = requiredFields[3].checked ? selectedRequests[i].request.headers : undefined;
              finalDataObject.requestCookies = requiredFields[4].checked ? selectedRequests[i].request.cookies : undefined;
              finalDataObject.responseHeaders = requiredFields[5].checked ? selectedRequests[i].response.headers : undefined;
              finalDataObject.response = requiredFields[6].checked ? values[i] : undefined;
              finalDataObject.responseCookies = requiredFields[7].checked ? selectedRequests[i].response.cookies : undefined;

              finalData.push(finalDataObject);
            }
            saveJsonFile(finalData, 'mockJson.json');
          });
        }, false); 
        
      });  
        	
		}
);

// chrome.devtools.network.onRequestFinished.addListener(
//   function(entries) {
//     if(entries.request.url == "http://example.com/"){
//       view_counts++;
//     }
//     _windowObj.document.getElementById("show_count").innerHTML = view_counts;
//   }
// );

function saveJsonFile(data, filename){
		if(!data) {
			console.error('Console.save: No data')
			return;
		}

		if(!filename) filename = 'console.json'

		if(typeof data === "object"){
			data = JSON.stringify(data, undefined, 4)
		}

		var blob = new Blob([data], {type: 'text/json'}),
				e    = document.createEvent('MouseEvents'),
				a    = document.createElement('a')

		a.download = filename
		a.href = window.URL.createObjectURL(blob)
		a.dataset.downloadurl =  ['text/json', a.download, a.href].join(':')
		e.initMouseEvent('click', true, false, 
											window, 0, 0, 0, 0, 0, 
											false, false, false, false, 0, null)
		a.dispatchEvent(e)
}



