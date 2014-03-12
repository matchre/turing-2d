/*global define: false */
/*jslint browser: true */
define(['jquery', 'stats', 'logic', 'jquery.mousewheel', 'html5slider', 'bootstrap', 'levels'],
    function (jQuery, Stats, TuringLogic) {
        "use strict";
        return {
            start: function () {
                var instruction;
                window.save = function () {return JSON.stringify(instruction.getRewriteManual()); }; //little hack for dev purpose
    
                window.onload = function () {
    
                    //init some stuffs
                    TuringLogic.initWhenDOMLoaded();
    
                    //models
                    var authorizerTape = TuringLogic.Authorizer.create(true),
                        authorizerInstruction = TuringLogic.Authorizer.create(true),
                        engine = TuringLogic.TuringEngine.create(TuringLogic.SocialMap.create(), TuringLogic.SocialMap.create()),
                        ll = TuringLogic.LevelsLoader.create(engine, authorizerTape, authorizerInstruction),
                        engineplayer = TuringLogic.EnginePlayer.create(engine, ll),
                        //scene
                        container = jQuery("#container"),
                        scene = TuringLogic.Scene.createWithDim(container.width(), container.height(), engine, authorizerTape, authorizerInstruction),
                        stats = new Stats();
                    
                    scene.getElement().appendTo(jQuery("#container"));
                    //.css({'position':'absolute' , 'top':'130px' , 'left':'20%' });
    
                    //left description panel
                    TuringLogic.DecriptionPanelView.create(engineplayer, ll, jQuery('#description'), jQuery('#navigation'));
                    TuringLogic.ToolBox.create(scene, engineplayer, ll).getElement().appendTo(jQuery("body")).css({'z-index': 50});
    
                    //init
                    ll.next();
    
    
                    instruction = engine.getInstruction();
    
                    //stats by mr doob
                    stats.setMode(0); // 0: fps, 1: ms

                    // Align top-left
                    stats.domElement.style.position = 'absolute';
                    stats.domElement.style.right = '50px';
                    stats.domElement.style.top = '0px';

                    document.body.appendChild(stats.domElement);
    
                    TuringLogic.timeLine.stats = stats;
                };

            }
        };
    }
    );