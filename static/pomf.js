$(function () {
	var uploadInput = $('#upload-input')
	  , uploadBtn = $('#upload-btn')
	  , uploadFiles = $('#upload-filelist')

	var btnContent = ""

	if (!$.hasFileAPI()) {
		$('#no-file-api').show()
		uploadBtn.hide()
	}

	uploadBtn.cabinet(uploadInput)

	uploadBtn.on('dragenter', function (e) {
		if (this === e.target) {
			$(this).addClass('drop')
			btnContent = $(this).html()
			$(this).html('Drop it here~')
		}
	})

	uploadBtn.on('drop', function (e) {
		$(this).trigger('dragleave')
	})

	uploadBtn.on('dragleave', function (e) {
		node = e.target
		do {
			if (node === this) {
				$(this).removeClass('drop')
				$(this).html(btnContent)
				break
			}
		} while (node = node.parentNode)
	})

	var MAX_SIZE = (function (node) {
		var max = node.attr('data-max-size') || '10MiB'
		var num = parseInt(/([0-9,]+).*/.exec(max)[1].replace(',', ''))
		var unit = /(?:([KMGTPEZY])(i)?B|([BKMGTPEZY]))/.exec(max) || ["B","",""]

		var oneUnit = Math.pow(
			(unit[2] === "i" ? 1024 : 1000),
			'BKMGTPEZY'.indexOf(unit[1])
		)

		return num * oneUnit
	})(uploadInput)

	var createRow = function (filename, size, extra) {
		var rowItem = $('<li class=file>')
		  , rowName = $('<span class=file-name>')
		  , rowProg = $('<div class="file-progress progress-outer">')
		  , rowSize = $('<span class=file-size>')
		  , rowUrl  = $('<span class=file-url>')

		rowItem.addClass(extra || '')

		$('<div class=progress-inner>').appendTo(rowProg)

		rowItem.attr('data-filename', escape(filename))
		rowName.text(filename)
		rowSize.text(size)

		rowItem.append(rowName, rowProg, rowSize, rowUrl)

		return rowItem
	}

	uploadBtn.on('change', function (e) {
		uploadFiles.empty().removeClass('error completed')

		var files = uploadInput[0].filelist;

		files.forEach(function (file) {
			if (!((file.name).indexOf('.exe', (file.name).length - '.exe'.length) !== -1)){
				createRow(file.name, file.humanSize).appendTo(uploadFiles)
			}else{
				var totalRow = createRow('', files.humanSize, 'total')
				totalRow.appendTo(uploadFiles)
				uploadFiles.addClass('error')
				$('.file-name', totalRow).text('Uploading .exe files is blocked due to abuse.')
				return
			}
		})

		var totalRow = createRow('', files.humanSize, 'total')
		totalRow.appendTo(uploadFiles)

		if (files.size > MAX_SIZE) {
			uploadFiles.addClass('error')

			$('.file-name', totalRow).text('Your PDF is too large, sorry.')
			return
		}

		var up = files.upload("")

		var eachRow = function (files, fn) {
			var hits = {}
			files.forEach(function (file) {
				++hits[file.name] || (hits[file.name] = 0)
				var row = $($('li[data-filename="' + escape(file.name) + '"]')[hits[file.name] || 0])
				fn.call(row, row, file, files)
			})
		}

		var totalName = $('.file-name', totalRow)

		up.on('uploadprogress', function (e, files) {
			eachRow(files, function (row, file, files) {
				$('.progress-inner', row).width((file.percentUploaded * 100) + '%')
			})
			$('.progress-inner', totalRow).width((files.percentUploaded * 100) + '%')
		})

		up.on('uploadcomplete', function (e) {
			$('.progress-inner').width('100%')
		})

        up.on('load', function (e, res) {
			var shit = 0
			switch (e.target.status) {
				case 200:
					var res = JSON.parse(res)
                    
					eachRow(res.files, function (row, file, files) {
						var link = $('<a>')
						link.attr('href', 'http://localhost:5000/' + file.url + file.name) 
							.attr('target', '_BLANK')
                            .attr('id', 'linkText' + shit)
							.text('localhost:5000/' + file.url + file.name)
						$('.file-url', row).append(link)

                        var buttonName = "'copyButton" + shit + "'"
						var copyButton = "<button id=" + buttonName + " class='copycat ion-link' data-clipboard-target='#linkText" + shit + "'></button>"
						
						$('.file-url', row).append(copyButton)

						shit++
					})

					uploadFiles.addClass('completed')
					totalName.text('Done!')
					break
				case 413:
					uploadFiles.addClass('error completed')
					totalName.html($('<div/>').html('Your PDF is too large, sorry.').text());
					break
				default:
					uploadFiles.addClass('error completed')
					totalName.text('Something went wrong; try again later.')
			}

            var btns = document.querySelectorAll('button');
            clipboard = new ClipboardJS(btns);
        })

		up.upload()
	})
})

function moon() {
	var ohayou = document.getElementById("ohayou")
	ohayou.innerHTML = "<ruby>おはよう! <rp>(</rp><rt>Ohay&#x14D;!</rt><rp>)</rp></ruby>"
	ohayou.lang = "jp"
}
