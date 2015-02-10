(function () {
    'use strict';

    /********************
        CONSTRUCTOR 
    *********************/ 
    var constructor = function () {
	   this.pointer = new EkWinjs.KinectPointer(this);
	}
	
    /********************
        INSTANCE DEFINE 
    *********************/ 
    var instanceMembers = {

        /********************
            Public variables 
        *********************/

        id: 0,
        //EkWinjs.KinectPointer
        pointer: null,

        pointMultiplier:1,

        trackArea: {
            x: 0.5,
            z: 1,
            dephX: 0.2,
            dephZ: 0.1,
            handPushZ: 0.25
        },

        rightHand: { x: 0, y: 0, z: 0 },

        leftHand: { x: 0, y: 0, z: 0 },

        head: { x: 0, y: 0, z: 0 },

        spineBase: { x: 0, y: 0, z: 0 },

        isTracked: false,
        handLeftTracked: false,
        handRightTracked: false,
       

        /********************
            Public methods 
        *********************/
        render: function () {
            this.pointer.render();
        },  

        startSimulate: function () {

            this.pointer.startSimulate();
        },
        
        stopSimulate: function () {
           this.pointer.stopSimulate();
        },


        /********************
            Private variables 
        *********************/
        _name: "",

        /********************
            Private methods 
        *********************/
        _funct: function () {
        },
    };

    /********************
        STATICS 
    *********************/
    var staticMembers = {
        ENUM: "enum",
        funct: function () {
        }
    };


    //class definition
    var Class = WinJS.Class.define(constructor, instanceMembers, staticMembers);

    WinJS.Namespace.define("EkWinjs", {
        kinectBodyData: Class
    });

})();



(function () {
    'use strict';


    var _this = null;
    var _needSimulation = null;

    /********************
        CONSTRUCTOR 
    *********************/
    var constructor = function () {

        _this = this;

    }


    /********************
        INSTANCE DEFINE 
    *********************/
    var instanceMembers = {
        /********************
            Public variables 
        *********************/


        /********************
            Public methods 
        *********************/
        setDebugs: function (debug) {
            this._debugs = debug;
        },

        trackBodyOn: function (x, dephX, z, dephZ) {

             _this._selectedBody = new EkWinjs.kinectBodyData();
             _this._selectedBody.trackArea.x = x;
             _this._selectedBody.trackArea.z = z;
             _this._selectedBody.trackArea.dephX = dephX;
             _this._selectedBody.trackArea.dephZ = dephZ;

             if(_needSimulation)
             {
                _this._selectedBody.startSimulate();
             }

            return _this._selectedBody;
        },


        getSelectedBody: function () {
            return _this._selectedBody;
        },

        /**

        */
        getPixelPoint: function (positionValue, allPixelsValue, multiplier) {
            if (!multiplier) multiplier = _this._autoMultiplier;

            var newWidth = allPixelsValue * multiplier;
            var diff = (newWidth - allPixelsValue) * 0.5;
            return (positionValue * newWidth) - diff;
        },

        setFrameSize: function (width, height) {
            this._frameWidth = width;
            this._frameHeight = height;
        },
        
        start: function (bodyFrameSource, JointType, jointCount) {

            this._bodyFrameReader = bodyFrameSource.openReader();
            this._bodyImageProcessor = KinectImageProcessor.BodyHelper;
            this._bodies = new Array(bodyFrameSource.bodyCount);

            this._JointType = JointType;
            this._jointCount = jointCount;

            this._bones = this._populateBones();

            this._bodyFrameReader.addEventListener("framearrived", this._reader_BodyFrameArrived);

        },

        startSimulate: function () {

            _needSimulation = true;

            if (_this._selectedBody) {
                _this._selectedBody.startSimulate();
            }
            
        },

        stopSimulate: function () {

            _needSimulation = false;

            if (_this._selectedBody) {
                _this._selectedBody.stopSimulate();
            }
        },

        close: function () {

            if (this._bodyFrameReader) this._bodyFrameReader.removeEventListener("framearrived", this._reader_BodyFrameArrived);

            this._bodyFrameReader = null;
        },


        /********************
            Private variables 
        *********************/
        _bodyFrameReader: null,
        _bodyImageProcessor: null,

        _bodies: null,
        _bones : null,
        _JointType: null,
        _jointCount: null,
        _frameWidth: 0,
        _frameHeight: 0,

        _selectedBody: null,
        _debugs: null,


        /********************
            Private methods 
        *********************/


        // Create array of bones
        _populateBones: function () {
            var bones = new Array();

            var jointType = window.WindowsPreview.Kinect.JointType;

            // torso
            bones.push({ jointStart: jointType.head, jointEnd: jointType.neck });
            bones.push({ jointStart: jointType.neck, jointEnd: jointType.spineShoulder });
            bones.push({ jointStart: jointType.spineShoulder, jointEnd: jointType.spineMid });
            bones.push({ jointStart: jointType.spineMid, jointEnd: jointType.spineBase });
            bones.push({ jointStart: jointType.spineShoulder, jointEnd: jointType.shoulderRight });
            bones.push({ jointStart: jointType.spineShoulder, jointEnd: jointType.shoulderLeft });
            bones.push({ jointStart: jointType.spineBase, jointEnd: jointType.hipRight });
            bones.push({ jointStart: jointType.spineBase, jointEnd: jointType.hipLeft });

            // right arm
            bones.push({ jointStart: jointType.shoulderRight, jointEnd: jointType.elbowRight });
            bones.push({ jointStart: jointType.elbowRight, jointEnd: jointType.wristRight });
            bones.push({ jointStart: jointType.wristRight, jointEnd: jointType.handRight });
            bones.push({ jointStart: jointType.handRight, jointEnd: jointType.handTipRight });
            bones.push({ jointStart: jointType.wristRight, jointEnd: jointType.thumbRight });

            // left arm
            bones.push({ jointStart: jointType.shoulderLeft, jointEnd: jointType.elbowLeft });
            bones.push({ jointStart: jointType.elbowLeft, jointEnd: jointType.wristLeft });
            bones.push({ jointStart: jointType.wristLeft, jointEnd: jointType.handLeft });
            bones.push({ jointStart: jointType.handLeft, jointEnd: jointType.handTipLeft });
            bones.push({ jointStart: jointType.wristLeft, jointEnd: jointType.thumbLeft });

            // right leg
            bones.push({ jointStart: jointType.hipRight, jointEnd: jointType.kneeRight });
            bones.push({ jointStart: jointType.kneeRight, jointEnd: jointType.ankleRight });
            bones.push({ jointStart: jointType.ankleRight, jointEnd: jointType.footRight });

            // left leg
            bones.push({ jointStart: jointType.hipLeft, jointEnd: jointType.kneeLeft });
            bones.push({ jointStart: jointType.kneeLeft, jointEnd: jointType.ankleLeft });
            bones.push({ jointStart: jointType.ankleLeft, jointEnd: jointType.footLeft });

            return bones;
        },



        _targetSelectedBody: function (jointPoints) {

            var isInTarget = false;

            if (this._selectedBody && this._selectedBody.trackArea) {
                var jointType = window.WindowsPreview.Kinect.JointType;

                var posX = jointPoints[jointType.spineBase].position.x / this._frameWidth;
                var posZ = jointPoints[jointType.spineBase].position.z;

                var targetX = this._selectedBody.trackArea.x;
                var targetZ = this._selectedBody.trackArea.z;

                var dephX = this._selectedBody.trackArea.dephX;
                var dephZ = this._selectedBody.trackArea.dephZ;

                var startX = targetX - dephX;
                var endX = targetX + dephX;
                var startZ = targetZ - dephZ;
                var endZ = targetZ + dephZ;

                if (posX > startX && posX < endX && posZ > startZ && posZ < endZ) {
                    isInTarget = true;
                }
            }


            return isInTarget;
        },



        _populateBodyDatas: function (body, bodyIndex, jointPoints) {


            if (_this._selectedBody) {

                _this._selectedBody.id = bodyIndex;

                var torsoHeight = jointPoints[_this._JointType.spineBase].position.y - jointPoints[_this._JointType.head].position.y;
                var PUSH_Z_ACTIVE = _this._selectedBody.trackArea.handPushZ;

                //set multiplier variable to auto-size the position of the body in space
                _this._selectedBody.pointMultiplier = 1 / (torsoHeight / _this._frameHeight) * 1.5;

                var handLeftPosition = jointPoints[_this._JointType.handLeft].position;
                var handRightPosition = jointPoints[_this._JointType.handRight].position;
                var headPosition = jointPoints[_this._JointType.head].position;

                //get hand position only on hand right up and push on front of head
                if (handRightPosition.y < jointPoints[_this._JointType.spineBase].position.y
                    && (headPosition.z - handRightPosition.z) > PUSH_Z_ACTIVE) {

                    _this._selectedBody.rightHandClosed = (body.handRightState == WindowsPreview.Kinect.HandState.closed);
                    _this._selectedBody.rightHandOpen = (body.handRightState == WindowsPreview.Kinect.HandState.open);

                    _this._selectedBody.rightHand.x = handRightPosition.x / _this._frameWidth;
                    _this._selectedBody.rightHand.y = handRightPosition.y / _this._frameHeight;
                    _this._selectedBody.rightHand.z = handRightPosition.z;

                    _this._selectedBody.handRightTracked = true;
                } else {
                    _this._selectedBody.handRightTracked = false;
                }

                //get hand position only on hand left up and push on front of head
                if (handLeftPosition.y < jointPoints[_this._JointType.spineBase].position.y
                 && (headPosition.z - handLeftPosition.z) > PUSH_Z_ACTIVE) {

                    _this._selectedBody.leftHandClosed = (body.handLeftState == WindowsPreview.Kinect.HandState.closed);
                    _this._selectedBody.leftHandOpen = (body.handLeftState == WindowsPreview.Kinect.HandState.open);

                    _this._selectedBody.leftHand.x = handLeftPosition.x / _this._frameWidth;
                    _this._selectedBody.leftHand.y = handLeftPosition.y / _this._frameHeight;
                    _this._selectedBody.leftHand.z = handLeftPosition.z;


                    _this._selectedBody.handLeftTracked = true;
                } else {
                    _this._selectedBody.handLeftTracked = false;
                }

                _this._selectedBody.head.x = headPosition.x / _this._frameWidth;
                _this._selectedBody.head.y = headPosition.y / _this._frameHeight;
                _this._selectedBody.head.z = headPosition.z;


                _this._selectedBody.spineBase.x = jointPoints[_this._JointType.spineBase].x / _this._frameWidth;
                _this._selectedBody.spineBase.y = jointPoints[_this._JointType.spineBase].y / _this._frameHeight;
                _this._selectedBody.spineBase.z = jointPoints[_this._JointType.spineBase].z;

                _this._selectedBody.isTracked = true;

                _this._selectedBody.render();
            }





        },

        _createJointPoints: function () {
            var jointPoints = new Array();

            for (var i = 0; i < this._jointCount; ++i) {
                jointPoints.push({ joint: 0, x: 0.5, y: 0.5, z: 0 });
            }

            return jointPoints;
        },


        /********************
            Events 
        *********************/
        _reader_BodyFrameArrived: function (args) {

            // get body frame
            var bodyFrame = args.frameReference.acquireFrame();
            var dataReceived = false;

            if (bodyFrame != null) {
                // got a body, update body data
                bodyFrame.getAndRefreshBodyData(_this._bodies);
                dataReceived = true;
                bodyFrame.close();
            }



            if (dataReceived) {


                //clear debug
                if (_this._debugs) {
                    for (var id in _this._debugs) {
                        if (!_this._debugs[id].disabledClear) _this._debugs[id].clearCanvas();
                    }
                }

                // iterate through each body
                for (var bodyIndex = 0; bodyIndex < _this._bodies.length; ++bodyIndex) {
                    var body = _this._bodies[bodyIndex];

                    // look for tracked bodies
                    if (body.isTracked) {
                        // get joints collection
                        var joints = body.joints;
                        // allocate space for storing joint locations
                        var jointPoints = _this._createJointPoints();

                        // call native component to map all joint locations to depth space
                        if (_this._bodyImageProcessor.processJointLocations(joints, jointPoints)) {

                            var isInTarget = _this._targetSelectedBody(jointPoints);

                            if (isInTarget) {
                                _this._populateBodyDatas(body, bodyIndex, jointPoints);
                            }


                            //debug
                            if (_this._debugs) {
                                for (var id in _this._debugs) {
                                    if (!_this._debugs[id].onlySelected || isInTarget) {
                                        _this._debugs[id].drawBody(body, jointPoints, bodyIndex, body.clippedEdges, _this._bones);
                                    }
                                }
                            }

                        }


                    }
                }

            }

        }


    };


    /********************
        STATICS 
    *********************/
    var staticMembers = {
        ENUM: "enum",
        funct: function () {
        }
    };


    //class definition
    var Class = WinJS.Class.define(constructor, instanceMembers, staticMembers);

    WinJS.Namespace.define("EkWinjs", {
        KinectBodyFrame: Class
    });

})();



(function () {
    'use strict';


    /********************
        ENUM 
    *********************/

    // handstate circle size
    var HANDSIZE = 20;

    // tracked bone line thickness
    var TRACKEDBONETHICKNESS = 4;

    // inferred bone line thickness
    var INFERREDBONETHICKNESS = 1;

    // thickness of joints
    var JOINTTHICKNESS = 3;

    // thickness of clipped edges
    var CLIPBOUNDSTHICKNESS = 5;

    // closed hand state color
    var HANDCLOSEDCOLOR = "red";

    // open hand state color
    var HANDOPENCOLOR = "green";

    // lasso hand state color
    var HANDLASSOCOLOR = "blue";

    // tracked joint color
    var TRACKEDJOINTCOLOR = "green";

    // inferred joint color
    var INFERREDJOINTCOLOR = "yellow";


    /********************
        CONSTRUCTOR 
    *********************/    
    var constructor = function (id) {
           
        this.id = id;
        this._bodyCanvas = document.getElementById(id);           
        this._bodyContext = this._bodyCanvas.getContext("2d");

        this._bodyColors = [
            "#FF4611",
            "#3A5CAC",
            "#8CB7E8",
            "#FFB718",
            "#DC0031",
            "#00ADBB"
        ];

    }


    /********************
        INSTANCE DEFINE 
    *********************/ 
    var instanceMembers = {

        /********************
            Public variables 
        *********************/

        id: null,

        onlySelected:false,  

        disabledClear:false,   
                
        /********************
            Public methods 
        *********************/

        setSize:function(width,height){
             this._bodyCanvas.width = width;
             this._bodyCanvas.height = height;  
        },
        clearCanvas: function () {
                        // clear canvas before drawing each frame
            this._bodyContext.clearRect(0, 0, this._bodyCanvas.width, this._bodyCanvas.height);
        },

        drawBody: function (body, jointPoints, bodyIndex, clippedEdges, bones) {

                // draw the body
            this._drawBodyJoints(body.joints, jointPoints, this._bodyColors[bodyIndex], bones);

                // draw handstate circles
            this._updateHandState(body.handLeftState, jointPoints[window.WindowsPreview.Kinect.JointType.handLeft]);
            this._updateHandState(body.handRightState, jointPoints[window.WindowsPreview.Kinect.JointType.handRight]);

                // draw clipped edges if any
            this._drawClippedEdges(clippedEdges);

        },

        /********************
            Private variables 
        *********************/

        _bodyCanvas : null,
        _bodyContext : null,     

        // defines a different color for each body
        _bodyColors : null,

        // total number of joints = 25
        _jointCount : null,


        /********************
            Private methods 
        *********************/
        
        _drawBodyJoints : function (joints, jointPoints, bodyColor, bones) {
            // draw all this._bones
            var boneCount = bones.length;
            for (var boneIndex = 0; boneIndex < boneCount; ++boneIndex) {

                var boneStart = bones[boneIndex].jointStart;
                var boneEnd = bones[boneIndex].jointEnd;

                var joint0 = joints.lookup(boneStart);
                var joint1 = joints.lookup(boneEnd);

                // don't do anything if either joint is not tracked
                if ((joint0.trackingState == window.WindowsPreview.Kinect.TrackingState.notTracked) ||
                    (joint1.trackingState == window.WindowsPreview.Kinect.TrackingState.notTracked)) {
                    return;
                }

                // all bone lines are inferred thickness unless both joints are tracked
                var boneThickness = INFERREDBONETHICKNESS;
                if ((joint0.trackingState == window.WindowsPreview.Kinect.TrackingState.tracked) &&
                    (joint1.trackingState == window.WindowsPreview.Kinect.TrackingState.tracked)) {
                    boneThickness = TRACKEDBONETHICKNESS;
                }

                this._drawBone(jointPoints[boneStart], jointPoints[boneEnd], boneThickness, bodyColor);
            }

            // draw all joints
            var jointColor = null;
            for (var jointIndex = 0; jointIndex < this._jointCount; ++jointIndex) {
                var trackingState = joints.lookup(jointIndex).trackingState;

                // only draw if joint is tracked or inferred
                if (trackingState == kinect.TrackingState.tracked) {
                    jointColor = TRACKEDJOINTCOLOR;
                }
                else if (trackingState == kinect.TrackingState.inferred) {
                    jointColor = INFERREDJOINTCOLOR;
                }

                if (jointColor != null) {
                    this._drawJoint(jointPoints[jointIndex], jointColor);
                }
            }
        },

        _drawHand : function (jointPoint, handColor) {
            // draw semi transparent hand cicles
            this._bodyContext.globalAlpha = 0.75;
            this._bodyContext.beginPath();
            this._bodyContext.fillStyle = handColor;
            this._bodyContext.arc(jointPoint.x, jointPoint.y, HANDSIZE, 0, Math.PI * 2, true);
            this._bodyContext.fill();
            this._bodyContext.closePath();
            this._bodyContext.globalAlpha = 1;
        },

        // Draw a joint circle on canvas
        _drawJoint : function (joint, jointColor) {
            this._bodyContext.beginPath();
            this._bodyContext.fillStyle = jointColor;
            this._bodyContext.arc(joint.position.x, joint.position.y, JOINTTHICKNESS, 0, Math.PI * 2, true);
            this._bodyContext.fill();
            this._bodyContext.closePath();
        },

        // Draw a bone line on canvas
        _drawBone : function (startPoint, endPoint, boneThickness, boneColor) {
            this._bodyContext.beginPath();
            this._bodyContext.strokeStyle = boneColor;
            this._bodyContext.lineWidth = boneThickness;
            this._bodyContext.moveTo(startPoint.position.x, startPoint.position.y);
            this._bodyContext.lineTo(endPoint.position.x, endPoint.position.y);
            this._bodyContext.stroke();
            this._bodyContext.closePath();
        },

        // Determine hand state
        _updateHandState : function (handState, jointPoint) {
            switch (handState) {
                case window.WindowsPreview.Kinect.HandState.closed:
                    this._drawHand(jointPoint, HANDCLOSEDCOLOR);
                    break;

                case window.WindowsPreview.Kinect.HandState.open:
                    this._drawHand(jointPoint, HANDOPENCOLOR);
                    break;

                case window.WindowsPreview.Kinect.HandState.lasso:
                    this._drawHand(jointPoint, HANDLASSOCOLOR);
                    break;
            }
        },

        // Draws clipped edges
        _drawClippedEdges : function (clippedEdges) {

            this._bodyContext.fillStyle = "red";

            if (this._hasClippedEdges(clippedEdges, window.WindowsPreview.Kinect.FrameEdges.bottom)) {
                this._bodyContext.fillRect(0, this._bodyCanvas.height - CLIPBOUNDSTHICKNESS, this._bodyCanvas.width, CLIPBOUNDSTHICKNESS);
            }

            if (this._hasClippedEdges(clippedEdges, window.WindowsPreview.Kinect.FrameEdges.top)) {
                this._bodyContext.fillRect(0, 0, this._bodyCanvas.width, CLIPBOUNDSTHICKNESS);
            }

            if (this._hasClippedEdges(clippedEdges, window.WindowsPreview.Kinect.FrameEdges.left)) {
                this._bodyContext.fillRect(0, 0, CLIPBOUNDSTHICKNESS, this._bodyCanvas.height);
            }

            if (this._hasClippedEdges(clippedEdges, window.WindowsPreview.Kinect.FrameEdges.right)) {
                this._bodyContext.fillRect(this._bodyCanvas.width - CLIPBOUNDSTHICKNESS, 0, CLIPBOUNDSTHICKNESS, this._bodyCanvas.height);
            }
        },

        // Checks if an edge is clipped
        _hasClippedEdges : function (edges, clippedEdge) {
            return ((edges & clippedEdge) != 0);
        }


    };

    /********************
        STATICS 
    *********************/
    var staticMembers = {
        ENUM: "enum",
        funct: function () {
        }
    };


    //class definition
    var Class = WinJS.Class.define(constructor, instanceMembers, staticMembers);

    WinJS.Namespace.define("EkWinjs", {
        KinectDebug: Class
    });

})();



(function () {
    'use strict';


    /********************
        SINGLETON 
    *********************/
    var _forceSingleton = false;
    var _instance = null;

    var _this = null;


    /********************
        CONSTRUCTOR 
    *********************/
    var constructor = function () {

        _this = this;

        if (!_forceSingleton) {
            throw "Use EkWinjs.Kinect.getInstance() instead of new EkWinjs.Kinect() to instanciate the Kinect singleton.";
        }

        //body frame reader
        this.bodyFrame = new EkWinjs.KinectBodyFrame();

        if (window.WindowsPreview) {

            this.platform = EkWinjs.Kinect.PLATFORMS.WIN8;

            //initrialize, resume or unload app
            this._checkAppState();

        } else {

            this.platform = EkWinjs.Kinect.PLATFORMS.WEB;
            this._simulateKinect();
        }


    };


    /********************
        INSTANCE DEFINE 
    *********************/
    var instanceMembers = {


        /********************
            Public variables 
        *********************/
        platform: "win8",

        //ek.KinectBodyFrame Class
        bodyFrame: null,

        /********************
            Public methods 
        *********************/
        
        isWin8Platform: function () { return this.platform == EkWinjs.Kinect.PLATFORMS.WIN8; },

        addCanvasDebug: function (id, onlyTrackedArea, disabledClear) {

            if (!onlyTrackedArea) onlyTrackedArea = false;

            this._debugs[id] = new EkWinjs.KinectDebug(id);
            this._debugs[id].onlySelected = onlyTrackedArea;
            this._debugs[id].disabledClear = disabledClear;


            if (this._frameDesc) {
                this._debugs[id].setSize(this._frameDesc.width, this._frameDesc.height);
            }

            if (this.bodyFrame) this.bodyFrame.setDebugs(this._debugs);

        },


        removeCanvasDebug: function (id) {
            delete this._debugs[id];
        },

        /********************
            Private variables 
        *********************/
        _app: null,
        _activation: null,
        _kinect: null,
        _sensor: null,
        _frameDesc: null,
        _debugs: {},
        _autoMultiplier: 1,


        /********************
            Private methods 
        *********************/

        _startKinect: function () {

            this._kinect = window.WindowsPreview.Kinect;
            this._sensor = this._kinect.KinectSensor.getDefault();

            this._frameDesc = this._sensor.bodyIndexFrameSource.frameDescription;
            this.bodyFrame.setFrameSize(this._frameDesc.width, this._frameDesc.height);

            this.bodyFrame.start(this._sensor.bodyFrameSource, this._kinect.JointType, this._kinect.Body.jointCount);

            this._sensor.addEventListener("isavailablechanged", this._sensor_IsAvailableChanged);

            this._sensor.open();

        },

        _simulateKinect: function () {
            this.bodyFrame.startSimulate();
        },


        _checkAppState: function () {

            this._app = WinJS.Application;
            this._activation = Windows.ApplicationModel.Activation;
            this._app.start();

            this._app.onactivated = function (args) {
                if (args.detail.kind === _this._activation.ActivationKind.launch) {
                    if (args.detail.previousExecutionState !== _this._activation.ApplicationExecutionState.terminated) {

                        //application constructorialize here
                        _this._startKinect();

                    } else {
                        // TODO: This application has been reactivated from suspension.
                        // Restore application state here.
                    }

                    args.setPromise(WinJS.UI.processAll());
                }
            };


            this._app.onunload = function (args) {

                if (this.bodyFrame) {
                    this.bodyFrame.close();
                }

                if (this._sensor != null) {
                    this._sensor.close();
                }
            }
        },

        /********************
            Events 
        *********************/

        _sensor_IsAvailableChanged: function (args) {
            WinJS.Resources.dispatchEvent(EkWinjs.Kinect.Events.Application.AVAILABILITY, _this._sensor.isAvailable);
        }



    };

    /********************
        STATICS 
    *********************/
    var staticMembers = {

        //enums
        PLATFORMS: {
            WIN8: "win8",
            WEB: "web"
        },

        Events: {
            Application: {
                 AVAILABILITY: "EkWinjs.Kinect.Events.Application.AVAILABILITY"
            },
            Pointer:{
                MOVE:"EkWinjs.Kinect.Events.Pointer.MOVE",
                OVER:"EkWinjs.Kinect.Events.Pointer.OVER",
                OUT:"EkWinjs.Kinect.Events.Pointer.OUT",
                DOWN:"EkWinjs.Kinect.Events.Pointer.DOWN",
                UP:"EkWinjs.Kinect.Events.Pointer.UP",
                HOLD_START:"EkWinjs.Kinect.Events.Pointer.HOLD_START",
                HOLD_PROGRESS:"EkWinjs.Kinect.Events.Pointer.HOLD_PROGRESS",
                HOLD_END:"EkWinjs.Kinect.Events.Pointer.HOLD_END"
            }
   
        },

        VERSION:"alpha_0.0.1",

        //methods
        getInstance: function () {

            if (!_instance) {
                _forceSingleton = true;
                _instance = new EkWinjs.Kinect();
                _forceSingleton = false;
            }

            return _instance;

        },

           // if (!multiplier) multiplier = _this._autoMultiplier;
        multiplyPixelPoint: function (positionValue, allPixelsValue, multiplier) {
            var newWidth = allPixelsValue * multiplier;
            var diff = (newWidth - allPixelsValue) * 0.5;
            return (positionValue * newWidth) - diff;
        }


    };


    //WinJs class defconstructorion
    var Class = WinJS.Class.define(constructor, instanceMembers, staticMembers);

    WinJS.Namespace.define("EkWinjs", {
        Kinect: Class
    });



})();




(function () {
    'use strict';


    var DELAY_HOLD = 10;
    var TIME_HOLD = 60;
    var COUNT_HOLD = 0;
    var COUNT_DELAY_HOLD = 0;

    /********************
        CONSTRUCTOR 
    *********************/ 
    var constructor = function (body) {
        this._body = body;  
    }
    
    /********************
        INSTANCE DEFINE 
    *********************/ 
    var instanceMembers = {
        /********************
            Public variables 
        *********************/
        name: "",
        x : 0,
        y: 0, 
        appWidth : window.innerWidth,
        appHeight : window.innerHeight,

        /********************
            Public methods 
        *********************/
        addEventListener: function (type, listener, target,settings) {

            var id = "";

            if(target.id && target.id!=""){
                id = target.id;
            }else if(target.className){
                id = target.className;
            }
         
            switch (type) {
                case EkWinjs.Kinect.Events.Pointer.MOVE:
                    this._funcsMove[id] = listener;
                    break;
                case EkWinjs.Kinect.Events.Pointer.OVER:  
                    this._funcsOver[id] = listener;
                    break;
                case EkWinjs.Kinect.Events.Pointer.OUT:
                    this._funcsOut[id] = listener;
                    break;
                case EkWinjs.Kinect.Events.Pointer.UP:
                    this._funcsUp[id] = listener;
                    break;
                case EkWinjs.Kinect.Events.Pointer.DOWN:
                    this._funcsDown[id] = listener;
                    break;
                case EkWinjs.Kinect.Events.Pointer.HOLD_START:
                    this._funcsHoldStart[id] = listener;
                    break;
                case EkWinjs.Kinect.Events.Pointer.HOLD_PROGRESS:
                    this._funcsHoldProgress[id] = listener;
                    break;
                case EkWinjs.Kinect.Events.Pointer.HOLD_END:
                    this._funcsHoldEnd[id] = listener;
                    break;
            }

            var forceHandClosed = false;
            if(settings)
            {
                forceHandClosed = settings.handClosed; 
            }
                

            this._targets[id] = { target: target, isOver:false, isHold:false, forceHandClosed:forceHandClosed, holdComplete:false };
          
        
        },  


        removeEventListener : function (type, listener, target) {
        
           var id = "";
           if(target.id && target.id !=""){
                id = target.id;
            }else if(target.className){
                id = target.className;
            }
         

            switch (type) {
                case EkWinjs.Kinect.Events.Pointer.MOVE:
                    this._funcsMove[id] = null;
                    break;
                case EkWinjs.Kinect.Events.Pointer.OVER:
                    this._funcsOver[id] = null;
                    break;
                case EkWinjs.Kinect.Events.Pointer.OUT:
                    this._funcsOut[id] = null;
                    break;
                case EkWinjs.Kinect.Events.Pointer.UP:
                    this._funcsUp[id] = null;
                    break;
                case EkWinjs.Kinect.Events.Pointer.DOWN:
                    this._funcsDown[id] = null;
                    break;
                case EkWinjs.Kinect.Events.Pointer.HOLD_START:
                    this._funcsHoldStart[id] = null;
                    break;
                case EkWinjs.Kinect.Events.Pointer.HOLD_PROGRESS:
                    this._funcsHoldProgress[id] = null;
                    break;
                case EkWinjs.Kinect.Events.Pointer.HOLD_END:
                    this._funcsHoldEnd[id] = null;
                    break;
            }
            if (this._targets[id]) {
                this._targets[id] = null;
            }
        },

        render: function(){

            var handValid = this._body.handLeftTracked || this._body.handRightTracked;

            var handClosed = false;
            var handOpen = false;

            if (this._body.isTracked) {

                if (handValid) {

                    if (this._body.handRightTracked && (this._body.rightHand.z < this._body.leftHand.z)) {

                        handClosed = this._body.rightHandClosed;
                        handOpen = this._body.rightHandOpen;

                        this.x = EkWinjs.Kinect.multiplyPixelPoint(this._body.rightHand.x,this.appWidth,this._body.pointMultiplier);
                        this.y = EkWinjs.Kinect.multiplyPixelPoint(this._body.rightHand.y, this.appHeight, this._body.pointMultiplier);
                        
                        
                        handValid = true;

                    } else if (this._body.handLeftTracked) {


                        handClosed = this._body.leftHandClosed;
                        handOpen = this._body.leftHandOpen;


                        this.x = EkWinjs.Kinect.multiplyPixelPoint(this._body.leftHand.x,this.appWidth,this._body.pointMultiplier);
                        this.y = EkWinjs.Kinect.multiplyPixelPoint(this._body.leftHand.y,this.appHeight,this._body.pointMultiplier);

                        handValid = true;

                    }

                    if (handClosed && !this._isDown) {

                        this._renderDownCallbacks();
                        this._isDown = true;

                    } else if (handOpen && this._isDown) {

                        this._renderUpCallbacks();
                        this._isDown = false;
                    }


                    if (!this._userActive) {
                        this._userActive = true;
                    }


                } else {

                    //no interaction with hands
                    if (this._userActive) {

                        this._userActive = false;

                        this._renderUpCallbacks();
                        this._isDown = false;
                    }

                }

                this._renderHoldCallbacks(handClosed);
                this._renderOverOutCallbacks();
                this._renderMoveCallbacks();

            }
                
        },


        startSimulate: function(){

            var _this = this;

            _this._userActive = false;


            document.addEventListener("mousedown", function(event){  

                _this._isDown = true;
                updateMousePosition(event);
                _this._renderDownCallbacks();
            });

            document.addEventListener("mouseup", function(event){  

                _this._isDown = false;
                updateMousePosition(event);
                _this._renderUpCallbacks();
            });


            document.addEventListener("mousemove", function(event){   
                updateMousePosition(event);

                _this._renderMoveCallbacks();
                _this._renderOverOutCallbacks();

                if(!_this._userActive)
                {
                    simulateRender();                    
                    _this._userActive = true;
                }

            });


            function updateMousePosition(event){
                _this.x = event.clientX +  (window.scrollX ? window.scrollX : document.documentElement.scrollLeft);
                _this.y = event.clientY + (window.scrollY ? window.scrollY : document.documentElement.scrollTop);
            }


            function simulateRender(){

                _this._renderHoldCallbacks(_this._isDown);
                window.requestAnimationFrame(simulateRender);

            }




        },


        stopSimulate: function(){            
            cancelAnimationFrame(this.startSimulate);
        },

        /********************
            Private variables 
        *********************/
        _body : null,

        _funcsMove : {},
        _funcsOver : {},
        _funcsOut : {},
        _funcsUp : {},
        _funcsDown : {},
        _funcsHoldStart : {},
        _funcsHoldProgress : {},
        _funcsHoldEnd : {},
        _targets : {},
        _isDown: false,
        _userActive:false,


        /********************
            Private methods 
        *********************/
        //get rectangle area of Html target
        _getRectangle : function (target) {
            var rect = {};

            rect.width = target.offsetWidth;
            rect.height = target.offsetHeight;

            rect.x = 0;
            rect.y = 0;
            var elem = target;
            do {
                if (!isNaN(elem.offsetLeft)) {
                    rect.x += elem.offsetLeft;
                }
                if (!isNaN(elem.offsetTop)) {
                    rect.y += elem.offsetTop;
                }
            } while (elem = elem.offsetParent);

            return rect;

        },
        //check if pointer is over target
        _checkIfIsOver : function(target) {
            var result = false;
            var rect;
            if (target.width && target.x) {
                rect = target;
            } else {
                rect = this._getRectangle(target);
            }

            if (this.x > rect.x && this.x < rect.x + rect.width && this.y > rect.y && this.y < rect.y + rect.height) {
                result = true;
            }
            return result;
        },


        _renderHoldCallbacks : function(userHandClosed) {

            for (var p in this._funcsHoldStart) {

                if (this._funcsHoldStart[p]!=null) {

                    // check if over target
                    if ((this._targets[p] && this._checkIfIsOver(this._targets[p].target))) {
                        
     
                        if (this._targets[p] && (!this._targets[p].forceHandClosed || userHandClosed) && (!this._targets[p].holdComplete)) {

                         
                            if (!this._targets[p].isHold) {

                                if (COUNT_DELAY_HOLD < DELAY_HOLD) {

                                    COUNT_DELAY_HOLD++;

                                } else {


                                    COUNT_DELAY_HOLD = 0;
                                    COUNT_HOLD = 0;

                                    this._targets[p].isHold = true;

                                    if (this._funcsHoldStart[p]) {
                                        this._funcsHoldStart[p](this._targets[p].target,COUNT_HOLD / TIME_HOLD);
                                    }

                                }


                            } else if (this._targets[p].isHold) {
                                if (COUNT_HOLD >= TIME_HOLD) {

                                    COUNT_HOLD = 0;
                                    this._targets[p].holdComplete = true;
                                    this._targets[p].isHold = false;


                                    if (this._funcsHoldEnd[p]) {
                                        this._funcsHoldEnd[p](this._targets[p].target,1);
                                    }

                                } else {
                                    COUNT_HOLD++;

                                    if (this._funcsHoldProgress[p]) {
                                        this._funcsHoldProgress[p](this._targets[p].target,COUNT_HOLD / TIME_HOLD);
                                    }
                                }
                            }
                        }

                    }else {
                        
                        if (this._targets[p] &&  this._targets[p].isHold){

                            COUNT_DELAY_HOLD = 0;
                            COUNT_HOLD = 0;

                            this._targets[p].holdComplete = false;
                            this._targets[p].isHold = false;
                        }
                    }
                }
            }
        },


        _renderOverOutCallbacks : function() {

            var check = false;

            for (var p in this._funcsOver) {
                if (this._funcsOver[p] != null) {

                    if (this._targets[p]) {
                        check = this._checkIfIsOver(this._targets[p].target);
                        // check if over target
                        if (!this._targets[p].isOver && check) {
                            this._targets[p].isOver = true;
                            this._funcsOver[p](this._targets[p].target);
                        }
                    }
                }
            }

            for (var p in this._funcsOut) {
                if (this._funcsOut[p] != null) {
                    if (this._targets[p]) {
                        check = this._checkIfIsOver(this._targets[p].target);


                         if (this._targets[p].isOver && !check) { // check if out target
                            this._targets[p].isOver = false;
                            this._funcsOut[p](this._targets[p].target);
                        }
                    }
                }
            }
        },
        

        _renderMoveCallbacks : function() {
            this._callListenersOnTarget(this._funcsMove);
        },

        _renderUpCallbacks : function() {
            this._callListenersOnTarget(this._funcsUp);
        },

        _renderDownCallbacks : function() {
            this._callListenersOnTarget(this._funcsDown);
        },

        _callListenersOnTarget : function(arrayListeners) {
            for (var p in arrayListeners) {
                if (arrayListeners[p] != null) {
                   
                    // check if over target
                    if (this._targets[p] && (!this._targets[p].target || (this._targets[p].target && this._checkIfIsOver(this._targets[p].target)))) {

                        //call listener
                        arrayListeners[p](this._targets[p].target);
                    }

                }
            }
        },


        _funct: function (type, listener, target, data) {
        },
    };

    /********************
        STATICS 
    *********************/
    var staticMembers = {
        ENUM: "enum",
        funct: function () {
        }
    };


    //class definition
    var Class = WinJS.Class.define(constructor, instanceMembers, staticMembers);

    WinJS.Namespace.define("EkWinjs", {
        KinectPointer: Class
    });

})();

