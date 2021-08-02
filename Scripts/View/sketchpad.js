/*
    繪圖相關物件
*/

function sketchpad(id, description) {

    var container = document.getElementById(id);
    var camera;
    var scene;
    var controls;
    var renderer;
    var stats = null;

    /*控制選項*/

    var aixs_x;
    var aixs_y;
    var aixs_z;
    var ground;
    var ground_grid;
    var help_line;
    var help_plane;

    var aixs_x_draw = false;
    var aixs_y_draw = false;
    var aixs_z_draw = false;
    var ground_draw = true;
    var ground_grid_draw = false;
    var help_line_draw = false;
    var help_plane_draw = false;

    /*基本function*/

    this.init = function (camera_fov, control_x, control_y, control_z) {

        console.log("初始化繪圖區: " + description);

        $("#" + id).empty();

        scene = new THREE.Scene();
        scene.fog = new THREE.Fog(0x72645b, 2, 600);
        //75
        //15
        camera = new THREE.PerspectiveCamera(camera_fov, $("#" + id).width() / $("#" + id).height(), 1, 600);
//        camera.position.set(3, 0.15, 3);
//        camera.up.set(0, 0, 1);

        camera.position.set(30, 40, 80);

        camera.up.set(0, 1, 0);

        add_aixs();        
        add_ground();
        add_ground_grid();
        add_help_line();
        add_help_plane();

        scene.add(new THREE.AmbientLight(0x777777));
        addShadowedLight(40, 40, 10, 0xffffff, 1.35);
        addShadowedLight(20, 40, 0, 0xffaa00, 1);

        renderer = new THREE.WebGLRenderer({ antialias: true });
        renderer.setSize($("#" + id).width(), $("#" + id).height());
        renderer.setClearColor(scene.fog.color, 1);
        renderer.gammaInput = true;
        renderer.gammaOutput = true;
        renderer.shadowMapEnabled = true;
        renderer.shadowMapCullFace = THREE.CullFaceBack;

        controls = new THREE.OrbitControls(camera, container, renderer.domElement);
        controls.damping = 0.2;
        controls.center.x = control_x;
        controls.center.y = control_y;
        controls.center.z = control_z;
        controls.addEventListener('change', render);

        container.appendChild(renderer.domElement);

        animate();
        render();

    }

    this.onWindowResize =function () {

        camera.aspect = $("#" + id).width() / $("#" + id).height();
        camera.updateProjectionMatrix();

        renderer.setSize($("#" + id).width(), $("#" + id).height());

        render();
    }

    this.render = render;
    function render() {

        renderer.render(scene, camera);
    }

    function animate() {

        requestAnimationFrame(animate);
        if (stats != null)
            stats.update();
        controls.update();

    }

    /*相關設定*/

    function addShadowedLight(x, y, z, color, intensity) {

        var directionalLight = new THREE.DirectionalLight(color, intensity);
        directionalLight.position.set(x, y, z)
        scene.add(directionalLight);

        directionalLight.castShadow = true;
        // directionalLight.shadowCameraVisible = true;

        var d = 40;
        directionalLight.shadowCameraLeft = -d;
        directionalLight.shadowCameraRight = d;
        directionalLight.shadowCameraTop = d;
        directionalLight.shadowCameraBottom = -d;
        
        directionalLight.shadowCameraNear = 1;
        directionalLight.shadowCameraFar = 160;

        directionalLight.shadowMapWidth = 1024;
        directionalLight.shadowMapHeight = 1024;

        directionalLight.shadowBias = -0.005;
        directionalLight.shadowDarkness = 0.15;
    }

    function add_aixs() {

        var red = new THREE.LineBasicMaterial({
            color: 0xff0000
        });
        var green = new THREE.LineBasicMaterial({
            color: 0x00ff00
        });
        var blue = new THREE.LineBasicMaterial({
            color: 0x0000ff
        });

        var line_x = new THREE.Geometry();
        line_x.vertices.push(new THREE.Vector3(0, 0, 0));
        line_x.vertices.push(new THREE.Vector3(1000, 0, 0));
        var line_y = new THREE.Geometry();
        line_y.vertices.push(new THREE.Vector3(0, 0, 0));
        line_y.vertices.push(new THREE.Vector3(0, 1000, 0));
        var line_z = new THREE.Geometry();
        line_z.vertices.push(new THREE.Vector3(0, 0, 0));
        line_z.vertices.push(new THREE.Vector3(0, 0, 1000));

        aixs_x = new THREE.Line(line_x, red);
        aixs_y = new THREE.Line(line_y, green);
        aixs_z = new THREE.Line(line_z, blue);
    }

    function add_ground() {

        ground = new THREE.Mesh(new THREE.PlaneGeometry(1600, 1600), new THREE.MeshPhongMaterial({ ambient: 0x999999, color: 0x999999, specular: 0x101010 }));
        ground.rotation.x += 270 * Math.PI / 180;

        scene.add(ground);
        ground.receiveShadow = true;
    }

    function add_ground_grid() {

        var black = new THREE.LineBasicMaterial({
            color: 0x000000
        });

        ground_grid = new THREE.Object3D();

        var line, line_geometry;

        for (var x = -400; x < 400; x = x + 100) {
            line_geometry = new THREE.Geometry();
            line_geometry.vertices.push(new THREE.Vector3(x, 0, -400));
            line_geometry.vertices.push(new THREE.Vector3(x, 0, 400));
            line = new THREE.Line(line_geometry, black);
            ground_grid.add(line);
        }

        for (var z = -400; z < 400; z = z + 100) {
            line_geometry = new THREE.Geometry();
            line_geometry.vertices.push(new THREE.Vector3(-400, 0, z));
            line_geometry.vertices.push(new THREE.Vector3(400, 0, z));
            line = new THREE.Line(line_geometry, black);
            ground_grid.add(line);
        }
    }


    function add_help_line() {

        var chi = new THREE.LineBasicMaterial({
            color: 0xff0000,
            opacity: 0.9,
            blending: THREE.AdditiveBlending,
            transparent: true
        });

        var che = new THREE.LineBasicMaterial({
            color: 0x00ff00,
            opacity: 0.9,
            blending: THREE.AdditiveBlending,
            transparent: true
        });

        var line, line_geometry;
        var height = 12;

        help_line = new THREE.Object3D();

        for (var i = 0; i < 8; i++) {

            line_geometry = new THREE.Geometry();
            line_geometry.vertices.push(new THREE.Vector3(-400, height / scale, 0));
            line_geometry.vertices.push(new THREE.Vector3(400, height / scale, 0));
            line = new THREE.Line(line_geometry, chi);
            help_line.add(line);

            height += 15;

            line_geometry = new THREE.Geometry();
            line_geometry.vertices.push(new THREE.Vector3(-400, height / scale, 0));
            line_geometry.vertices.push(new THREE.Vector3(400, height / scale, 0));
            line = new THREE.Line(line_geometry, che);
            help_line.add(line);

            height += 6;
        }
    }

    function add_help_plane() {

        var chi = new THREE.MeshPhongMaterial({
            ambient: 0x999999,
            color: 0x999999,
            specular: 0x101010,
            opacity: 0.5,
            transparent: true,
            side : THREE.DoubleSide
        })

        var che = new THREE.MeshPhongMaterial({
            ambient: 0x999999,
            color: 0x999999,
            specular: 0x101010,
            opacity: 0.5,
            transparent: true,
            side: THREE.DoubleSide
        });

        var plane;
        var plane_geometry = new THREE.PlaneGeometry(50, 50);
        var height = 12;

        help_plane = new THREE.Object3D();

        for (var i = 0; i < 8; i++) {

            plane = new THREE.Mesh(plane_geometry, chi);
            plane.rotation.x += 270 * Math.PI / 180;
            plane.position.y = height / scale;
            help_plane.add(plane);

            height += 15;

            plane = new THREE.Mesh(plane_geometry, che);
            plane.rotation.x += 270 * Math.PI / 180;
            plane.position.y = height / scale;
            help_plane.add(plane);

            height += 6;
        }
    }

    /*附加設定*/

    this.add_stats = function () {

        stats = new Stats();
        stats.domElement.style.position = 'absolute';
        stats.domElement.style.top = '0px';
        container.appendChild(stats.domElement);
    }

    this.add_info = function (html) {
        
        var info = document.createElement('div');
        info.style.position = 'absolute';
        info.style.top = '10px';
        info.style.width = '100%';
        info.style.textAlign = 'center';
        info.innerHTML = html;
        container.appendChild(info);
    }

    /*外部呼叫用*/

    this.add_model_by_url = function (url,color) {

        var loader = new THREE.ColladaLoader();
        loader.load(url, function (dae) {

            collada = dae.scene;
            var material = new THREE.MeshPhongMaterial({ ambient: 0xff5533, color: color, specular: 0x111111, shininess: 200 });

            collada.traverse(function (child) {
                if (child instanceof THREE.Mesh) {

                    child.material = material;
                    child.castShadow = true;
                    child.receiveShadow = true;
                }
            });

            dae.scene.scale.x = 1;
            dae.scene.scale.y = 1;
            dae.scene.scale.z = 1;

            scene.add(dae.scene);

            render();
        });
    }

    this.add_model = function (model) {

        scene.add(model);
    }

    this.remove_model = function (model) {

        scene.remove(model);
    }

    this.save_as_STL = function (name) {

        console.log("繪圖區: " + description + " 輸出成stl檔案");

        scene.remove(aixs_x);
        scene.remove(aixs_y);
        scene.remove(aixs_z);
        scene.remove(ground);

//        var exporter = new THREE.STLExporter();
        var exporter = new THREE.STLBinaryExporter();
        var stlString = exporter.parse(scene);

        var blob = new Blob([stlString], { type: 'text/plain' });

        saveAs(blob, name + '.stl');

        if (aixs_x_draw)
            scene.add(aixs_x);
        if (aixs_y_draw)
            scene.add(aixs_y);
        if (aixs_z_draw)
            scene.add(aixs_z);
        if (ground_draw)
            scene.add(ground);
    }

    /*控制選項*/

    this.set_aixs = function (type) {

        var line,line_draw;

        switch (type) {
            case "aixs_x":
                line = aixs_x;
                line_draw = aixs_x_draw;
                aixs_x_draw = !aixs_x_draw;
                break;
            case "aixs_y":
                line = aixs_y;
                line_draw = aixs_y_draw;
                aixs_y_draw = !aixs_y_draw;
                break;
            case "aixs_z":
                line = aixs_z;
                line_draw = aixs_z_draw;
                aixs_z_draw = !aixs_z_draw;
                break;
        }

        if (line_draw)
            scene.remove(line);
        else
            scene.add(line);

        render();
    }

    this.set_ground = function () {

        if (ground_draw)
            scene.remove(ground);
        else
            scene.add(ground);

        ground_draw = !ground_draw;

        render();
    }

    this.set_ground_grid = function () {

        if (ground_grid_draw)
            scene.remove(ground_grid);
        else
            scene.add(ground_grid);

        ground_grid_draw = !ground_grid_draw;

        render();
    }

    this.set_help_line = function () {

        if (help_line_draw)
            scene.remove(help_line);
        else
            scene.add(help_line);

        help_line_draw = !help_line_draw;

        render();
    }

    this.set_help_plane = function () {

        if (help_plane_draw)
            scene.remove(help_plane);
        else
            scene.add(help_plane);

        help_plane_draw = !help_plane_draw;

        render();
    }

}
