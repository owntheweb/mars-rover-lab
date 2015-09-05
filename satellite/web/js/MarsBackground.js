//animated Mars scene background

//!!! to-do: handle screen resize

var MarsBackground = function() {
	this.scene;
	this.camera;
	this.renderer;
	this.marsMesh;
	this.sphere2;
	this.skydome;
	this.skydome2;
};

MarsBackground.prototype.init = function() {
	var marsContainer, canvas, light, marsGeo, marsMat, sphere2Mat, skydomeGeo, skydomeMat, skydome2Geo, skydome2Mat;

	this.scene = new THREE.Scene();
	this.camera = new THREE.PerspectiveCamera( 35, window.innerWidth/window.innerHeight, 0.1, 3000 );
	this.camera.position.set(0, 0, 0);
	
	marsContainer = new THREE.Object3D(); //will make rotating Mars at an angle simpler
	marsContainer.position.set(20, -7, -80);

	canvas = document.getElementById("marsBackground");
	this.renderer = new THREE.WebGLRenderer({alpha: true, antialias:true, canvas:canvas});
	this.renderer.setSize( window.innerWidth, window.innerHeight );

	light = new THREE.SpotLight(0x5aaeff, 0.8, 0, Math.PI / 2, 1);
	light.position.set(-3000, 1200, 0);
	light.target.position.set (0, 0, 0);
	this.scene.add(light);

	marsGeo = new THREE.SphereGeometry (30, 40, 100); 
	marsMat = new THREE.MeshPhongMaterial(); 
	marsMat.shininess = 10;

	// diffuse map
	marsMat.map = THREE.ImageUtils.loadTexture('/images/marsmap2048.jpg');

	// bump map
	marsMat.bumpMap = THREE.ImageUtils.loadTexture('/images/marsbump2048.jpg');
	marsMat.bumpScale = 0.55;

	this.marsMesh = new THREE.Mesh(marsGeo, marsMat);
	this.marsMesh.rotation.y = Math.PI * .65;
	marsContainer.add(this.marsMesh);

	//outer wire mesh 2
	sphere2Geo = new THREE.SphereGeometry(30.2, 30, 30);
	sphere2Mat = new THREE.MeshPhongMaterial({
	        wireframe: true,
	        transparent: true,
			  color: 0x2795ff
	    });
	this.sphere2 = new THREE.Mesh(sphere2Geo, sphere2Mat);
	marsContainer.add(this.sphere2);

	//skydome in its own scene
	skydomeGeo = new THREE.SphereGeometry(400, 45, 45);
	skydomeMat = new THREE.MeshPhongMaterial({
	        wireframe: true,
	        transparent: true,
			  color: 0x2795ff
	    });
	this.skydome = new THREE.Mesh(skydomeGeo, skydomeMat);
	marsContainer.add(this.skydome);

	skydome2Geo = new THREE.SphereGeometry(420, 45, 45);
	skydome2Mat = new THREE.MeshBasicMaterial();
	skydome2Mat.shininess = 0;
	skydome2Mat.map = THREE.ImageUtils.loadTexture('/images/stars4096.jpg');
	skydome2Mat.side = THREE.BackSide;
	
	this.skydome2 = new THREE.Mesh(skydome2Geo, skydome2Mat);
	marsContainer.add(this.skydome2);

	this.scene.add(marsContainer);

	// automatically resize renderer
    THREEx.WindowResize(this.renderer, this.camera);

};

MarsBackground.prototype.startRendering = function() {
	var self = this;

	var render = function() {
		requestAnimationFrame(render);

		self.marsMesh.rotation.y += 0.0002;
		self.skydome.rotation.y -= 0.0001;
		self.skydome2.rotation.y += 0.0002;
		self.sphere2.rotation.y += 0.0004;

		self.renderer.render(self.scene, self.camera);
	}
		
	render();
};