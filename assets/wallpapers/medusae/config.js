App = window.App || {};
App.STATIC_URL = "./build/static/";

(function() {
  function getSafeDimensions() {
    var w = window.innerWidth;
    var h = window.innerHeight;
    if (!w || !h || w < 50 || h < 50) {
      try {
        if (window.parent && window.parent.innerWidth && window.parent.innerHeight) {
          w = window.parent.innerWidth;
          h = window.parent.innerHeight;
        }
      } catch (_) {}
    }
    if (!w || !h || w < 50 || h < 50) {
      w = 1920;
      h = 1080;
    }
    return { width: Math.max(320, w), height: Math.max(240, h) };
  }

  // Override WebGL clear color to make the background pitch black
  if (App.MainScene && App.MainScene.prototype) {
    App.MainScene.prototype.updateClearColor = function() {
      if (this.renderer) {
        this.renderer.setClearColor(0x000000, 1);
      }
    };

    var origOnWindowResize = App.MainScene.prototype.onWindowResize;
    App.MainScene.prototype.onWindowResize = function() {
      var dims = getSafeDimensions();
      var width = dims.width;
      var height = dims.height;
      var pxRatio = this.pxRatio || 1.5;

      var postWidth = width * pxRatio;
      var postHeight = height * pxRatio;
      var aspect = width / height;

      var scale = Math.max(0.65, height / 1000);
      var minDistance = scale * 180;
      var maxDistance = scale * 1300;

      this.width = width;
      this.height = height;

      if (this.camera) {
        this.camera.aspect = aspect;
        this.camera.updateProjectionMatrix();

        // Prevent camera from collapsing to (0,0,0) inside the jellyfish belly
        if (!this.camera.position || this.camera.position.length() < 120 || isNaN(this.camera.position.x)) {
          this.camera.position.set(scale * 420, scale * 310, 0);
          if (this.scene) {
            this.camera.lookAt(this.scene.position);
          }
        }
      }

      if (this.controls) {
        this.controls.minDistance = minDistance;
        this.controls.maxDistance = maxDistance;
        this.controls.target.set(0, 0, 0);
        if (typeof this.controls.handleResize === 'function') {
          this.controls.handleResize();
        }
      }

      if (App.Tweens && typeof App.Tweens.mapRange === 'function') {
        this.mapDistance = App.Tweens.mapRange(minDistance, maxDistance, 0, 1);
        this.mapSoundDistance = App.Tweens.mapRange(minDistance, maxDistance * 1.3, 0, 1);
      }

      if (this.renderer) {
        this.renderer.setSize(width, height);
      }
      if (this.composer) {
        this.composer.setSize(postWidth, postHeight);
      }
      if (this.lensDirtPass) {
        this.lensDirtPass.setSize(postWidth, postHeight);
      }

      this.needsRender = true;
    };

    // Protect physics from delta spikes and NaN values
    var origUpdate = App.MainScene.prototype.update;
    App.MainScene.prototype.update = function(delta) {
      var safeDelta = Math.min(35, Math.max(1, delta || 16.6));
      origUpdate.call(this, safeDelta);
    };

    // Add cinematic slow orbital drift to showcase the jellyfish in 3D
    var origPreRender = App.MainScene.prototype.preRender;
    App.MainScene.prototype.preRender = function(delta, stepProgress) {
      if (this.camera && this.camera.position && !isNaN(this.camera.position.x)) {
        var angle = 0.00035;
        var x = this.camera.position.x;
        var z = this.camera.position.z;
        this.camera.position.x = x * Math.cos(angle) - z * Math.sin(angle);
        this.camera.position.z = x * Math.sin(angle) + z * Math.cos(angle);
        if (this.controls && this.controls.target) {
          this.controls.target.set(0, 0, 0);
        }
      }
      origPreRender.call(this, delta, stepProgress);
    };

    // Hook constructor to store instance and guarantee camera is correctly offset
    var OrigMainScene = App.MainScene;
    App.MainScene = function() {
      OrigMainScene.apply(this, arguments);
      window._currentMedusaeScene = this;
      var dims = getSafeDimensions();
      var scale = Math.max(0.65, dims.height / 1000);
      this.camera.position.set(scale * 420, scale * 310, 0);
      this.camera.lookAt(this.scene.position);
      if (this.controls) {
        this.controls.target.set(0, 0, 0);
        this.controls.position0 = this.camera.position.clone();
        this.controls.target0 = this.controls.target.clone();
      }
    };
    App.MainScene.prototype = OrigMainScene.prototype;
    if (typeof Particulate !== 'undefined' && Particulate.ctor) {
      App.MainScene.create = Particulate.ctor(App.MainScene);
    }
  }

  // Watch for visibility and resize triggers
  function triggerResize() {
    if (window._currentMedusaeScene) {
      window._currentMedusaeScene.onWindowResize();
    }
  }

  window.addEventListener('resize', triggerResize, { passive: true });
  window.addEventListener('message', function(e) {
    if (e.data && (e.data.type === 'resize' || e.data.type === 'activate')) {
      triggerResize();
    }
  });

  // Check periodically in case iframe became visible without an explicit resize event
  var checkCount = 0;
  var interval = setInterval(function() {
    checkCount++;
    if (window._currentMedusaeScene && window.innerWidth > 100) {
      if (Math.abs(window._currentMedusaeScene.width - window.innerWidth) > 10) {
        triggerResize();
      }
    }
    if (checkCount > 60) clearInterval(interval);
  }, 500);
})();

// Mute all audio by providing a dummy AudioController
App.AudioController = {
  create: function() {
    return {
      loadBuffer: function() { 
        return Promise.resolve(); 
      },
      playSound: function() {},
      addListener: function() {},
      removeListener: function() {},
      pause: function() {},
      resume: function() {},
      update: function() {},
      volume: 0,
      distance: 0
    };
  }
};

