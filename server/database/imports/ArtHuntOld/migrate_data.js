const fs = require('fs');

function migrateSiteTemplate() {
	let data = fs.readFileSync('sites.json');
	let json_data = JSON.parse(data.toString());

	let new_data = [];

	json_data.forEach(item => {
		let obj = {
			"_id": item._id,
			"location": item.location,
			"main_img": item.main_image,
			"closeup": item.abstract_image,
			"title": item.artwork_name,
			"artist": item.artist,
			"year": item.year,
			"active": item.active,
			"theme": item.theme,
			"lat": parseFloat(item.lat),
			"long": parseFloat(item.long),
			"information": item.information,
			"type": item.type,
			"clue": item.clue,
			"notes": item.notes
		}
		new_data.push(obj);
	});

	fs.writeFileSync('site_template_migrate.json', JSON.stringify(new_data));
}

migrateSiteTemplate();