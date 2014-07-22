/**    
 * @author Jefferson González
 * @copyright 2010 Jefferson González
 *
 * @license 
 * This file is part of Jaris FLV Player.
 *
 * Jaris FLV Player is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License or GNU LESSER GENERAL 
 * PUBLIC LICENSE as published by the Free Software Foundation, either version 
 * 3 of the License, or (at your option) any later version.
 *
 * Jaris FLV Player is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License and 
 * GNU LESSER GENERAL PUBLIC LICENSE along with Jaris FLV Player.  If not, 
 * see <http://www.gnu.org/licenses/>.
 */

package jaris.player;

import flash.display.Loader;
import flash.display.MovieClip;
import flash.display.Sprite;
import flash.display.Stage;
import flash.display.BitmapData;
import flash.display.JPEGEncoderOptions;
import flash.utils.ByteArray;
import flash.display.StageDisplayState;
import flash.events.AsyncErrorEvent;
import flash.events.Event;
import flash.events.EventDispatcher;
import flash.events.FullScreenEvent;
import flash.events.IOErrorEvent;
import flash.events.KeyboardEvent;
import flash.events.MouseEvent;
import flash.events.NetStatusEvent;
import flash.events.ProgressEvent;
import flash.events.TimerEvent;
import flash.geom.Rectangle;
import flash.Lib;
import flash.media.ID3Info;
import flash.media.Sound;
import flash.media.SoundChannel;
import flash.media.SoundTransform;
import flash.media.Video;
import flash.net.NetConnection;
import flash.net.NetStream;
import flash.net.URLRequest;
import flash.system.Capabilities;
import flash.system.Security;
import flash.ui.Keyboard;
import flash.ui.Mouse;
import flash.utils.Timer;
import jaris.events.PlayerEvents;
import jaris.utils.Utils;
import jaris.player.AspectRatio;
import jaris.player.UserSettings;
import flash.errors.IOError;


/**
 * Jaris main video player
 */
class Player extends EventDispatcher
{
	//{Member variables
	private var _stage:Stage;
	private var _movieClip:MovieClip;
	private var _connection:NetConnection;
	private var _stream:NetStream;
	private var _fullscreen:Bool;
	private var _soundMuted:Bool;
	private var _volume:Float;
	private var _bufferTime:Float;
	private var _mouseVisible:Bool;
	private var _mediaLoaded:Bool;
	private var _hideMouseTimer:Timer;
	private var _checkAudioTimer:Timer;
	private var _mediaSource:String;
	private var _type:String;
	private var _streamType:String;
	private var _server:String; //For future use on rtmp
	private var _sound:Sound;
	private var _soundChannel:SoundChannel;
	private var _id3Info:ID3Info;
	private var _video:Video;
	private var _videoWidth:Float;
	private var _videoHeight:Float;
	public var _naturalWidth:Float;
	public var _naturalHeight:Float;
	public var fullMetaData:Dynamic;
	private var _videoMask:Sprite;
	private var _videoQualityHigh:Bool;
	private var _mediaDuration:Float;
	private var _lastTime:Float;	
	private var _lastProgress:Float;
	private var _isPlaying:Bool;
	private var _aspectRatio:Float;
	private var _currentAspectRatio:String;
	private var _originalAspectRatio:Float;
	private var _mediaEndReached:Bool;
	private var _seekPoints:Array<Float>;
	private var _downloadCompleted:Bool;
	private var _startTime:Float;
	private var _firstLoad:Bool;
	private var _stopped:Bool;
	private var _useHardWareScaling:Bool;
	private var _youtubeLoader:Loader;
	private var _userSettings:UserSettings;
	private var _loadedYoutube:Bool;
	private var _ytReady:Bool;
	private var _ytCue:Bool;
	public var noAPITrigger:Bool;
	public var _showLoader:Bool;
	private var _preLoading:Bool;
	private var _requestedPlay:Bool;
	private var _requestedLoad:Bool;
	private var _allowPreloadedPlay:Bool;
	private var _hasPoster:Bool;
	public var lastSeekTime:Float;
	//}
	
	
	//{Constructor
	public function new() 
	{
		super();
		
		//{Main Variables Init
		_stage = Lib.current.stage;
		_movieClip = Lib.current;
		_mouseVisible = true;
		_soundMuted = false;
		_volume = 1.0;
		_bufferTime = 10;
		_fullscreen = false;
		_mediaLoaded = false;
		_requestedLoad = false;
		_hideMouseTimer = new Timer(1500);
		_checkAudioTimer = new Timer(100);
		_seekPoints = new Array();
		_downloadCompleted = false;
		_startTime = 0;
		_firstLoad = true;
		_stopped = false;
		_videoQualityHigh = false;
		_loadedYoutube = false;
		_ytReady = false;
		_ytCue = false;
		_isPlaying = false;
		_streamType = StreamType.FILE;
		_type = InputType.VIDEO;
		_server = "";
		_currentAspectRatio = "original";
		_aspectRatio = 0;
		_lastTime = 0;
		_lastProgress = 0;
		_userSettings = new UserSettings();
		noAPITrigger = false;
		_hasPoster = false;
		_showLoader = true;
		lastSeekTime = 0;
		_allowPreloadedPlay = false;
		_naturalWidth =  0;
		_naturalHeight = 0;
		//}
		
		//{Initialize sound object
		_sound = new Sound();
		_sound.addEventListener(Event.COMPLETE, onSoundComplete);
        _sound.addEventListener(Event.ID3, onSoundID3);
        _sound.addEventListener(IOErrorEvent.IO_ERROR, onSoundIOError);
        _sound.addEventListener(ProgressEvent.PROGRESS, onSoundProgress);

		//}
		
		//{Initialize video and connection objects
		_connection = new NetConnection();
		_connection.client = this;
		_connection.connect(null);
		_stream = new NetStream(_connection);
		
		_video = new Video(_stage.stageWidth, _stage.stageHeight);
		
		_movieClip.addChild(_video);
		//}
		
		//Video mask so that custom menu items work
		_videoMask = new Sprite();
		_movieClip.addChild(_videoMask);
		
		//Set initial rendering to high quality
		toggleQuality();
		
		//{Initialize system event listeners
		_movieClip.addEventListener(Event.ENTER_FRAME, onEnterFrame);
		_stage.addEventListener(KeyboardEvent.KEY_DOWN, onKeyDown);
		_stage.addEventListener(MouseEvent.MOUSE_MOVE, onMouseMove);
		_stage.addEventListener(FullScreenEvent.FULL_SCREEN, onFullScreen);
		_stage.addEventListener(Event.RESIZE, onResize);
		_hideMouseTimer.addEventListener(TimerEvent.TIMER, hideMouseTimer);
		_checkAudioTimer.addEventListener(TimerEvent.TIMER, checkAudioTimer);
		_connection.addEventListener(NetStatusEvent.NET_STATUS, onNetStatus);
		_connection.addEventListener(AsyncErrorEvent.ASYNC_ERROR, onAsyncError);
		//}
	}
	//}
	
	public function init():Void
	{
		var parameters:Dynamic<String> = flash.Lib.current.loaderInfo.parameters;
		
		if(parameters.poster == "" && _streamType == StreamType.YOUTUBE && _mediaSource != null){
			_ytCue = true;
			noAPITrigger = true;
			load(_mediaSource, _type, _streamType, _server);
			noAPITrigger = false;
		}
	}
	
	
	public function createScreenShot()
	{
		var width = Std.int(_stage.width);
		var height = Std.int(_stage.width);
		
		var qImageData:BitmapData = new BitmapData(width, height, false, 0x00FF00);
		var byteArray:ByteArray = new ByteArray();
		
		qImageData.draw(_video);
		qImageData.encode(new Rectangle(0, 0, width, height), new flash.display.JPEGEncoderOptions(), byteArray);
		
		return Utils.enocdeBytesData(byteArray);
	}
	
	
	//{Timers
	/**
	 * Timer that hides the mouse pointer when it is idle and dispatch the PlayerEvents.MOUSE_HIDE
	 * @param	event
	 */
	private function hideMouseTimer(event:TimerEvent):Void
	{
		if (_fullscreen)
		{
			if (_mouseVisible)
			{
				_mouseVisible = false;
			}
			else
			{
				Mouse.hide();
				callEvents(PlayerEvents.MOUSE_HIDE);
				_hideMouseTimer.stop();
			}
		}
	}
	
	/**
	 * To check if the sound finished playing
	 * @param	event
	 */
	private function checkAudioTimer(event:TimerEvent):Void
	{
		if (_soundChannel.position + 100 >= _sound.length)
		{
			_isPlaying = false;
			_mediaEndReached = true;
			callEvents(PlayerEvents.PLAYBACK_FINISHED);
			
			_checkAudioTimer.stop();
		}
	}
	//}
	
	
	//{Events
	/**
	 * Callback after bandwidth calculation for rtmp streams
	 */
	private function onBWDone():Void
	{
		//Need to study this more
	}
	
	/**
	 * Triggers error event on rtmp connections
	 * @param	event
	 */
	private function onAsyncError(event:AsyncErrorEvent):Void
	{
		//TODO: Should trigger event for controls to display error message
		trace(event.error);
	}
	
	/**
	 * Checks if connection failed or succeed
	 * @param	event
	 */
	private function onNetStatus(event:NetStatusEvent):Void
	{
		switch (event.info.code)
		{
			case "NetConnection.Connect.Success":
				if (_streamType == StreamType.RTMP)
				{
					_stream = new NetStream(_connection);
					_stream.addEventListener(NetStatusEvent.NET_STATUS, onNetStatus);
					_stream.bufferTime = 10;
					_stream.play(Utils.rtmpSourceParser(_mediaSource), true);
					_stream.client = this;
					if(_type == InputType.VIDEO) {_video.attachNetStream(_stream); }
				}
				callEvents(PlayerEvents.CONNECTION_SUCCESS);

			case "NetStream.Play.StreamNotFound":
				trace("Stream not found: " + _mediaSource); //Replace with a dispatch for error event
				callEvents(PlayerEvents.CONNECTION_FAILED);
				
			case "NetStream.Play.Stop":
				if (_streamType != StreamType.RTMP)
				{
					if (_isPlaying) { _stream.togglePause(); }
					_isPlaying = false;
					_mediaEndReached = true;
					callEvents(PlayerEvents.PLAYBACK_FINISHED);
				}
				
			case "NetStream.Play.Start":
				
				_mediaEndReached = false;
				if (_isPlaying && (_stream.bytesLoaded != _stream.bytesTotal || _streamType == StreamType.RTMP))
				{
					callEvents(PlayerEvents.BUFFERING);
				}
				
			case "NetStream.Seek.Notify":
				_mediaEndReached = false;
				if (_streamType == StreamType.RTMP)
				{
					_isPlaying = true;
					callEvents(PlayerEvents.PLAY_PAUSE);
					callEvents(PlayerEvents.BUFFERING);
				}
				
			case "NetStream.Buffer.Empty":
				if (_stream.bytesLoaded != _stream.bytesTotal)
				{
					callEvents(PlayerEvents.BUFFERING);
				}
				
			case "NetStream.Buffer.Full":
				callEvents(PlayerEvents.NOT_BUFFERING);
				
			case "NetStream.Buffer.Flush":
				if (_stream.bytesLoaded == _stream.bytesTotal)
				{
					_downloadCompleted = true;
				}
		}
	}
	
	/**
	 * Proccess keyboard shortcuts
	 * @param	event
	 */
	private function onKeyDown(event:KeyboardEvent):Void
	{
		var F_KEY:UInt = 70;
		var M_KEY:UInt = 77;
		
		switch(event.keyCode)
		{
			
			case F_KEY:
				toggleFullscreen();
				
			case M_KEY:
				toggleMute();
				
			
			case Keyboard.SPACE:
				togglePlay();
		}
	}
	
	/**
	 * IF player is full screen shows the mouse when gets hide
	 * @param	event
	 */
	private function onMouseMove(event:MouseEvent):Void
	{
		if (_fullscreen && !_mouseVisible)
		{
			if (!_hideMouseTimer.running)
			{
				_hideMouseTimer.start();
			}
			
			_mouseVisible = true;
			Mouse.show();
			
			callEvents(PlayerEvents.MOUSE_SHOW);
		}
	}
	
	/**
	 * Resize video player
	 * @param	event
	 */
	private function onResize(event:Event):Void
	{
		resizeAndCenterPlayer();
	}
	
	/**
	 * Dispath a full screen event to listeners as redraw player an takes care of some other aspects
	 * @param	event
	 */
	private function onFullScreen(event:FullScreenEvent):Void
	{
		_fullscreen = event.fullScreen;
		
		if (!event.fullScreen)
		{
			Mouse.show();
			callEvents(PlayerEvents.MOUSE_SHOW);
			_mouseVisible = true;
		}
		else
		{
			_mouseVisible = true;
			_hideMouseTimer.start();
		}
		
		resizeAndCenterPlayer();
		
		callEvents(PlayerEvents.FULLSCREEN);
	}
	
	/**
	 * Sits for any cue points available
	 * @param	data
	 * @note Planned future implementation
	 */
	private function onCuePoint(data:Dynamic):Void
	{
		
	}
	
	/**
	 * After a video is loaded this callback gets the video information at start and stores it on variables
	 * @param	data
	 */
	private function onMetaData(data:Dynamic):Void
	{
		var i, fields;
		
		if (_firstLoad)
		{
			_isPlaying = _preLoading ? false:true;
			
			_firstLoad = false;
			
			
			
			if (data.width)
			{
				_videoWidth = data.width;
				_videoHeight = data.height;
			}
			else
			{
				_videoWidth = _video.width;
				_videoHeight = _video.height;
			}
			
			_naturalWidth =  _video.videoWidth;
			_naturalHeight = _video.videoHeight;
			
			if (_naturalWidth == 0) {
				_naturalWidth = _videoWidth;
			}
			
			if (_naturalHeight == 0) {
				_naturalHeight = _videoHeight;
			}
			
			//Store seekpoints times
			if (data.hasOwnProperty("seekpoints")) //MP4
			{
				for (position in Reflect.fields(data.seekpoints))
				{
					_seekPoints.push(Reflect.field(data.seekpoints, position).time);
				}
			}
			else if (data.hasOwnProperty("keyframes")) //FLV
			{
				for (position in Reflect.fields(data.keyframes.times))
				{
					_seekPoints.push(Reflect.field(data.keyframes.times, position));
				}
			}
			
			_mediaLoaded = true;
			_mediaDuration = data.duration;
			_originalAspectRatio = AspectRatio.getAspectRatio(_videoWidth, _videoHeight);
			
			if (_aspectRatio <= 0)
			{
				_aspectRatio = _originalAspectRatio;
			}
			
			fields = Reflect.fields(data);
			fullMetaData = { };
			for (i in fields) {
				Reflect.setField(fullMetaData, i, Reflect.field(data, i));
			}
			
			callEvents(PlayerEvents.MEDIA_INITIALIZED);
			
			resizeAndCenterPlayer();
			//Retrieve the volume that user selected last time
			setVolume(_userSettings.getVolume());
		}
	}
	
	/**
	 * Dummy function invoked for pseudostream servers
	 * @param	data
	 */
	private function onLastSecond(data:Dynamic):Void
	{
		trace("last second pseudostream");
	}
	
	/**
	 * Broadcast Timeupdate and Duration	 
	 */	
	private function onEnterFrame(event:Event):Void
	{
		if (getDuration() > 0 && _lastTime != getCurrentTime()) 
		{
			_lastTime = getCurrentTime();
			callEvents(PlayerEvents.TIME);
		}
		
		if (getBytesLoaded() > 0 && _lastProgress < getBytesLoaded()) 
		{
			_lastProgress = getBytesLoaded();
			callEvents(PlayerEvents.PROGRESS);
		}
		
	}		
	
	
	/**
	 * Triggers when playbacks end on rtmp streaming server
	 */
	private function onPlayStatus(info:Dynamic):Void
	{
		_isPlaying = false;
		_mediaEndReached = true;
		callEvents(PlayerEvents.PLAYBACK_FINISHED);
	}
	
	/**
	 * When sound finished downloading
	 * @param	event
	 */
	private function onSoundComplete(event:Event)
	{		
		_mediaDuration = _sound.length / 1000;
		_downloadCompleted = true;
		
		callEvents(PlayerEvents.MEDIA_INITIALIZED);
	}
	
	/**
	 * Mimic stream onMetaData
	 * @param	event
	 */
	private function onSoundID3(event:Event)
	{
		if (_firstLoad)
		{
			_soundChannel = _sound.play();
			_checkAudioTimer.start();

			_isPlaying = true;
			
			_firstLoad = false;
			
			_mediaLoaded = true;
			_mediaDuration = ((_sound.bytesTotal / _sound.bytesLoaded) * _sound.length) / 1000;
			_aspectRatio = AspectRatio.getAspectRatio(_videoWidth, _videoHeight);
			_originalAspectRatio = _aspectRatio;
			_id3Info = _sound.id3;
			
			callEvents(PlayerEvents.CONNECTION_SUCCESS);
			callEvents(PlayerEvents.MEDIA_INITIALIZED);
			
			resizeAndCenterPlayer();
			
			//Retrieve the volume that user selected last time
			setVolume(_userSettings.getVolume());
		}
	}
	
	/**
	 * Dispatch connection failed event on error
	 * @param	event
	 */
	private function onSoundIOError(event:IOErrorEvent)
	{
		callEvents(PlayerEvents.CONNECTION_FAILED);
	}
	
	/**
	 * Monitor sound download progress
	 * @param	event
	 */
	private function onSoundProgress(event:ProgressEvent)
	{
		var oldDuration = _mediaDuration;
		if (_sound.isBuffering)
		{
			callEvents(PlayerEvents.BUFFERING);
		}
		else
		{
			callEvents(PlayerEvents.NOT_BUFFERING);
		}
		
		_mediaDuration = ((_sound.bytesTotal / _sound.bytesLoaded) * _sound.length) / 1000;
		if (_mediaDuration != oldDuration) {
			callEvents(PlayerEvents.MEDIA_INITIALIZED);
		}
	}
	
	/**
	 * Initializes the youtube loader object
	 * @param	event
	 */
	private function onYouTubeLoaderInit(event:Event):Void
	{
		_youtubeLoader.content.addEventListener("onReady", onYoutubeReady);
		_youtubeLoader.content.addEventListener("onError", onYoutubeError);
		_youtubeLoader.content.addEventListener("onStateChange", onYoutubeStateChange);
		_youtubeLoader.content.addEventListener("onPlaybackQualityChange", onYoutubePlaybackQualityChange);

	}
	
	/**
	 * This event is fired when the player is loaded and initialized, meaning it is ready to receive API calls.
	 */
	private function onYoutubeReady(event:Event):Void
	{
		_movieClip.addChild(_youtubeLoader.content);
		_movieClip.setChildIndex(_youtubeLoader.content, 0);
		_ytReady = true;
		Reflect.field(_youtubeLoader.content, "setSize")(_stage.stageWidth, _stage.stageHeight);
		if(_ytCue && !_isPlaying && !_requestedPlay){
			Reflect.field(_youtubeLoader.content, "cueVideoByUrl")(Utils.youtubeSourceParse(_mediaSource), 0, Utils.youtubeQualitySourceParse(_mediaSource));
		} else {
			Reflect.field(_youtubeLoader.content, "loadVideoByUrl")(Utils.youtubeSourceParse(_mediaSource), 0, Utils.youtubeQualitySourceParse(_mediaSource));
			callEvents(PlayerEvents.BUFFERING);
		}
	}

	/**
	 * This event is fired whenever the player's state changes. Possible values are unstarted (-1), ended (0), 
	 * playing (1), paused (2), buffering (3), video cued (5). When the SWF is first loaded it will broadcast 
	 * an unstarted (-1) event. When the video is cued and ready to play it will broadcast a video cued event (5).
	 * @param	event
	 */
	private function onYoutubeStateChange(event:Event):Void
	{
		var status:UInt = Std.parseInt(Reflect.field(event, "data"));
		var oldPlaying:Bool = _isPlaying;
		var quality;
		if (!_mediaLoaded && _ytCue && !_isPlaying && _requestedPlay) {
			play();
		}
		_mediaLoaded = true;
		switch(status)
		{
			case -1:
				callEvents(PlayerEvents.BUFFERING);
			
			case 0:
				_isPlaying = false;
				_mediaEndReached = true;
				callEvents(PlayerEvents.PLAYBACK_FINISHED);
				
			case 1:
				_isPlaying = true;
				if (_firstLoad)
				{
					
					_videoWidth = _stage.stageWidth;
					_videoHeight = _stage.stageHeight;
					quality =  Reflect.field(_youtubeLoader.content, "getPlaybackQuality")();
					
					switch(quality)
						{
							case 'small':
								_naturalHeight = 240;
								_naturalWidth =  320;
								
							case 'medium':
								_naturalHeight = 360;
								_naturalWidth =  640;
								
							case 'large':
								_naturalHeight = 480;
								_naturalWidth =  853;
								
							case 'hd720':
								_naturalHeight = 720;
								_naturalWidth =  1280;
								
							case 'hd1080':
								_naturalHeight = 1080;
								_naturalWidth =  1920;
								
							case 'highres':
								_naturalHeight = 1080;
								_naturalWidth =  1920;
						}
					
					
					if (_naturalWidth == 0) {
						_naturalWidth = _videoWidth;
					}
					
					if (_naturalHeight == 0) {
						_naturalHeight = _videoHeight;
					}
				
					_firstLoad = false;
					
					
					_mediaDuration = Reflect.field(_youtubeLoader.content, "getDuration")();
					_aspectRatio = AspectRatio.getAspectRatio(_videoWidth, _videoHeight);
					_originalAspectRatio = _aspectRatio;
					
					callEvents(PlayerEvents.CONNECTION_SUCCESS);
					callEvents(PlayerEvents.MEDIA_INITIALIZED);
					
					resizeAndCenterPlayer();
					
					//Retrieve the volume that user selected last time
					setVolume(_userSettings.getVolume());
				}
				callEvents(PlayerEvents.NOT_BUFFERING);
				if(oldPlaying != _isPlaying){
					callEvents(PlayerEvents.PLAY_PAUSE);
				}
				
			case 2:
				_isPlaying = false;
				callEvents(PlayerEvents.NOT_BUFFERING);
				if(oldPlaying != _isPlaying){
					callEvents(PlayerEvents.PLAY_PAUSE);
				}
				
			case 3:
				callEvents(PlayerEvents.BUFFERING);
				
			case 5:
				callEvents(PlayerEvents.NOT_BUFFERING);
		}
		
	}
    
	/**
	 * This event is fired whenever the video playback quality changes. For example, if you call the 
	 * setPlaybackQuality(suggestedQuality) function, this event will fire if the playback quality actually 
	 * changes. Your code should respond to the event and should not assume that the quality will automatically 
	 * change when the setPlaybackQuality(suggestedQuality) function is called. Similarly, your code should not 
	 * assume that playback quality will only change as a result of an explicit call to setPlaybackQuality or any 
	 * other function that allows you to set a suggested playback quality.
	 * 
	 * The value that the event broadcasts is the new playback quality. Possible values are "small", "medium", 
	 * "large" and "hd720".
	 * @param	event
	 */
	private function onYoutubePlaybackQualityChange(event:Event):Void
	{
		//trace(Reflect.field(event, "data"));
	}
   
	/**
	 * This event is fired when an error in the player occurs. The possible error codes are 100, 101, 
	 * and 150. The 100 error code is broadcast when the video requested is not found. This occurs when 
	 * a video has been removed (for any reason), or it has been marked as private. The 101 error code is 
	 * broadcast when the video requested does not allow playback in the embedded players. The error code 
	 * 150 is the same as 101, it's just 101 in disguise!
	 * @param	event
	 */
	private function onYoutubeError(event:Event):Void
	{
		trace(Reflect.field(event, "data"));
	}
	//}
	
	
	//{Private Methods
	/**
	 * Function used each time is needed to dispatch an event
	 * @param	type
	 */
	private function callEvents(type:String):Void
	{
		var playerEvent:PlayerEvents = new PlayerEvents(type, true);
		
		playerEvent.aspectRatio = getAspectRatio();
		playerEvent.duration = getDuration();
		playerEvent.fullscreen = isFullscreen();
		playerEvent.mute = getMute();
		playerEvent.volume = getVolume();
		playerEvent.width = _video.width;
		playerEvent.height = _video.height;
		playerEvent.stream = getNetStream();
		playerEvent.sound = getSound();
		playerEvent.time = getCurrentTime();
		playerEvent.id3Info = getId3Info();
		playerEvent.seekTime = lastSeekTime;
		
		dispatchEvent(playerEvent);
	}
	
	/**
	 * Reposition and resizes the video player to fit on screen
	 */
	private function resizeAndCenterPlayer():Void
	{
		if (_streamType != StreamType.YOUTUBE)
		{
			_video.height = _stage.stageHeight;
			_video.width = _video.height * _aspectRatio;
			
			_video.x = (_stage.stageWidth / 2) - (_video.width / 2);
			_video.y = 0;
			
			if (_video.width > _stage.stageWidth && _aspectRatio == _originalAspectRatio)
			{
				var aspectRatio:Float = _videoHeight / _videoWidth;
				_video.width = _stage.stageWidth;
				_video.height = aspectRatio * _video.width;
				_video.x = 0;
				_video.y = (_stage.stageHeight / 2) - (_video.height / 2);
			}
			
			_videoMask.graphics.clear();
			_videoMask.graphics.lineStyle();
			_videoMask.graphics.beginFill(0x000000, 0);
			_videoMask.graphics.drawRect(_video.x, _video.y, _video.width, _video.height);
			_videoMask.graphics.endFill();
		}
		else
		{
			Reflect.field(_youtubeLoader.content, "setSize")(_stage.stageWidth, _stage.stageHeight);
			
			_videoMask.graphics.clear();
			_videoMask.graphics.lineStyle();
			_videoMask.graphics.beginFill(0x000000, 0);
			_videoMask.graphics.drawRect(0, 0, _stage.stageWidth, _stage.stageHeight);
			_videoMask.graphics.endFill();
		}
		
		callEvents(PlayerEvents.RESIZE);
	}
	
	/**
	 * Check the best seek point available if the seekpoints array is available
	 * @param	time time in seconds
	 * @return best seek point in seconds or given one if no seekpoints array is available
	 */
	private function getBestSeekPoint(time:Float):Float
	{
		if (_seekPoints.length > 0)
		{
			var timeOne:String="0";
			var timeTwo:String="0";
			
			for(prop in Reflect.fields(_seekPoints))
			{
				if(Reflect.field(_seekPoints,prop) < time)
				{
					timeOne = prop;
				}
				else
				{
					timeTwo = prop;
				break;
				}
			}

			if(time - _seekPoints[Std.parseInt(timeOne)] < _seekPoints[Std.parseInt(timeTwo)] - time)
			{
				return _seekPoints[Std.parseInt(timeOne)];
			}
			else
			{
				return _seekPoints[Std.parseInt(timeTwo)];
			}
		}
		
		return time;
	}
	
	/**
	 * Checks if the given seek time is already buffered
	 * @param	time time in seconds
	 * @return true if can seek false if not in buffer
	 */
	private function canSeek(time:Float):Bool
	{
		if (_type == InputType.VIDEO)
		{
			time = getBestSeekPoint(time);
		}
		
		var cacheTotal = Math.floor((getDuration() - _startTime) * (getBytesLoaded() / getBytesTotal())) - 1;

		if(time >= _startTime && time < _startTime + cacheTotal)
		{
			return true;
		}
		
		return false;
	}
	//}
	
	
	//{Public methods	
	/**
	 * Preload a video without playing
	 */
	public function preload():Void
	{
		if (!_requestedLoad && !_mediaLoaded && _mediaSource != "" && !_requestedPlay) {
			var isVideo = (_type == InputType.VIDEO && (_streamType == StreamType.FILE || _streamType == StreamType.PSEUDOSTREAM));
			var isAudio = (_type == InputType.AUDIO && _streamType == StreamType.FILE);
			
			if(isVideo || isAudio){
				stopAndClose();
				
				load(_mediaSource, _type, _streamType, _server, true);
				_stopped = false;
				_mediaLoaded = false;
				_firstLoad = true;
				_startTime = 0;
				_downloadCompleted = false;
				_preLoading = true;
				_allowPreloadedPlay = true;
			}
			
		}
	}
	
	
	//{Public methods	
	/**
	 * Loads a video and starts playing it
	 * @param	video video url to load
	 */
	public function load(source:String, type:String="video", streamType:String="file", server:String="", preload:Bool=false):Void
	{
		
		if(!_requestedLoad && !_mediaLoaded && (_streamType != StreamType.YOUTUBE || !_loadedYoutube)){
			stopAndClose();
			
			
			_type = type;
			_streamType = streamType;
			_mediaSource = source;
			_stopped = false;
			_mediaLoaded = false;
			_firstLoad = true;
			_startTime = 0;
			_downloadCompleted = false;
			_seekPoints = new Array();
			_server = server;
			_requestedLoad = true;
			
			if (!preload) {
				callEvents(PlayerEvents.BUFFERING);
			}
			
			if (_streamType == StreamType.YOUTUBE)
			{
				Security.allowDomain("*");
				Security.allowDomain("www.youtube.com");  
				Security.allowDomain("youtube.com");  
				Security.allowDomain("i4.ytimg.com");
				Security.allowDomain("s.ytimg.com");  
				Security.allowDomain("i.ytimg.com"); 
			
				_youtubeLoader = new Loader();
				_youtubeLoader.contentLoaderInfo.addEventListener(Event.INIT, onYouTubeLoaderInit);
				_youtubeLoader.load(new URLRequest("https://www.youtube.com/apiplayer?version=3"));
				_loadedYoutube = true;
			}
			else if (_type == InputType.VIDEO && (_streamType == StreamType.FILE || _streamType == StreamType.PSEUDOSTREAM))
			{	
				_connection.connect(null);
				_stream = new NetStream(_connection);
				_stream.addEventListener(NetStatusEvent.NET_STATUS, onNetStatus);
				_stream.bufferTime = _bufferTime;
				_stream.play(source);
				_stream.client = this;
				_video.attachNetStream(_stream);
				
				if (preload) {
					pause();
					_isPlaying = false;
				}
				if (!preload || !_hasPoster) {
					_video.attachNetStream(_stream);
				}
			}
			else if (_streamType == StreamType.RTMP)
			{
				_connection.connect(_server);
			}
			else if(_type == InputType.AUDIO && _streamType == StreamType.FILE)
			{
				_sound.load(new URLRequest(source));
				try {
					_soundChannel = _sound.play();
					
					if (preload) {
						_soundChannel.stop();
						_isPlaying = false;	
					} else {
						_isPlaying = true;
					}
					
					_firstLoad = false;
					
					_mediaLoaded = true;
					
				} catch (error:IOError) { }
			}
		}
	}
	
	/**
	 * Closes the connection and makes player available for another video
	 */
	public function stopAndClose():Void
	{
		if (_mediaLoaded || _requestedLoad)
		{
			_requestedLoad = false;
			_mediaLoaded = false;
			_isPlaying = false;
			_stopped = true;
			_startTime = 0;
			_allowPreloadedPlay = false;
			
			
			if (_streamType == StreamType.YOUTUBE)
			{
				Reflect.field(_youtubeLoader.content, "destroy")();
			}
			else if (_type == InputType.VIDEO)
			{
				_stream.close();
			}
			else
			{
				_soundChannel.stop();
				_sound.close();
			}
		}
		
		callEvents(PlayerEvents.STOP_CLOSE);
	}
	
	
	/**
	 * Seeks video player to a given time in seconds
	 * @param	seekTime time in seconds to seek
	 * @return current play time after seeking
	 */
	public function seek(seekTime:Float):Float
	{
		if (_startTime <= 1 && _downloadCompleted)
		{
			if (_type == InputType.VIDEO || _streamType == StreamType.RTMP)
			{
				_stream.seek(seekTime);
			}
			else if (_type == InputType.AUDIO)
			{
				_soundChannel.stop();
				_soundChannel = _sound.play(seekTime * 1000);
				if (!_isPlaying)
				{
					_soundChannel.stop();
				}
				
				setVolume(_userSettings.getVolume());
			}
		}
		else if(_seekPoints.length > 0 && _streamType == StreamType.PSEUDOSTREAM)
		{
			seekTime = getBestSeekPoint(seekTime);
			
			if (canSeek(seekTime))
			{
				_stream.seek(seekTime - _startTime);
			}
			else if(seekTime != _startTime)
			{	
				_startTime = seekTime;
				
				var url:String;
				if (_mediaSource.indexOf("?") != -1)
				{
					url = _mediaSource + "&start=" + seekTime;
				}
				else
				{
					url = _mediaSource + "?start=" + seekTime;
				}
				_stream.play(url);
			}
		}
		else if (_streamType == StreamType.YOUTUBE)
		{
			if (!canSeek(seekTime))
			{
				if(_ytReady){
					_startTime = seekTime;
					Reflect.field(_youtubeLoader.content, "seekTo")(seekTime);
				}
			}
			else if(_ytReady)
			{
				Reflect.field(_youtubeLoader.content, "seekTo")(seekTime);
			}
			
		}
		else if (_streamType == StreamType.RTMP)
		{
			// seekTime = getBestSeekPoint(seekTime); //Not Needed?
			_stream.seek(seekTime);
		}
		else if(canSeek(seekTime))
		{
			if (_type == InputType.VIDEO || _streamType == StreamType.RTMP)
			{
				_stream.seek(seekTime);
			}
			else if (_type == InputType.AUDIO)
			{
				_soundChannel.stop();
				_soundChannel = _sound.play(seekTime * 1000);
				if (!_isPlaying)
				{
					_soundChannel.stop();
				}
				
				setVolume(_userSettings.getVolume());
			}
		}
		lastSeekTime = seekTime;
		callEvents(PlayerEvents.SEEK);
		return seekTime;
	}
	
	/**
	 * To check wheter the media is playing
	 * @return true if is playing false otherwise
	 */
	public function isPlaying():Bool
	{
		return _isPlaying;
	}
	
	
	/**
	 * Swithces between play and pause
	 */
	public function togglePlay():Bool
	{
		if (_isPlaying) {
			this.pause();
		} else {
			this.play();
		}
		return _isPlaying;
	}
	
	/**
	 * pause
	 */
	public function pause():Bool
	{
		_requestedPlay = false;
		if (!_mediaEndReached)
			
		{
			if (_streamType == StreamType.YOUTUBE)
			{
				if(_ytReady){
					Reflect.field(_youtubeLoader.content, "pauseVideo")();
				}
			}
			else if (_type == InputType.VIDEO || _streamType == StreamType.RTMP)
			{
				_stream.pause();
			}
			else if (_type == InputType.AUDIO)
			{
				_soundChannel.stop();
			}
		}
		
		if (_isPlaying){
			_isPlaying = false;
			
			callEvents(PlayerEvents.PLAY_PAUSE);
			if (!_mediaLoaded) {
				callEvents(PlayerEvents.NOT_BUFFERING);
			}
			
		}
		return _isPlaying;
		
	}
	
	/**
	 * 
	 */
	public function play():Bool
	{
		_video.attachNetStream(_stream);
		_preLoading = false;
		_requestedPlay = true;
		
		if (_mediaLoaded || _allowPreloadedPlay)
		{
			if (_mediaEndReached)
			{
				_mediaEndReached = false;
				
				if (_streamType == StreamType.YOUTUBE)
				{
					Reflect.field(_youtubeLoader.content, "seekTo")(0);
					Reflect.field(_youtubeLoader.content, "playVideo")();
					
				}
				else if (_type == InputType.VIDEO || _streamType == StreamType.RTMP)
				{
					_stream.seek(0);
					_stream.resume();
				}
				else if (_type == InputType.AUDIO)
				{
					_checkAudioTimer.start();
					
					_soundChannel = _sound.play();
					
					setVolume(_userSettings.getVolume());
				}
			}
			else
			{
				if (_streamType == StreamType.YOUTUBE)
				{
					if(_ytReady){
						Reflect.field(_youtubeLoader.content, "playVideo")();
					}
				}
				else if (_type == InputType.VIDEO || _streamType == StreamType.RTMP)
				{
					_stream.resume();
				}
				else if (_type == InputType.AUDIO)
				{
					if(!_isPlaying){
						//If end of audio reached start from beggining
						if (_soundChannel.position + 100 >= _sound.length)
						{
							_soundChannel = _sound.play();
						}
						else 
						{
							_soundChannel = _sound.play(_soundChannel.position);
						}
					}
					setVolume(_userSettings.getVolume());
					
				}
			}
			
			if (!_isPlaying){
				_isPlaying = true;
				callEvents(PlayerEvents.PLAY_PAUSE);
			}
			return _isPlaying;
		}
		else if(_mediaSource != "")
		{
			load(_mediaSource, _type, _streamType, _server);
			callEvents(PlayerEvents.BUFFERING);
			_isPlaying = true;
			return true;
		}
		
		return true;
	}
	
	/**
	 * Switches on or off fullscreen
	 * @return true if fullscreen otherwise false
	 */
	public function toggleFullscreen():Bool 
	{
		if (_fullscreen)
		{
			_stage.displayState = StageDisplayState.NORMAL;
			_stage.focus = _stage;
			return false;
		}
		else
		{	
			if (_useHardWareScaling)
			{
				//Match full screen aspec ratio to desktop
				var aspectRatio = Capabilities.screenResolutionY / Capabilities.screenResolutionX;
				_stage.fullScreenSourceRect = new Rectangle(0, 0, _videoWidth, _videoWidth * aspectRatio);
			}
			else
			{
				//Use desktop resolution
				_stage.fullScreenSourceRect = new Rectangle(0, 0, Capabilities.screenResolutionX ,Capabilities.screenResolutionY);
			}
			
			_stage.displayState = StageDisplayState.FULL_SCREEN;
			_stage.focus = _stage;
			return true;
		}
	}
	
	/**
	 * Toggles betewen high and low quality image rendering
	 * @return true if quality high false otherwise
	 */
	public function toggleQuality():Bool
	{
		if (_videoQualityHigh)
		{
			_video.smoothing = false;
			_video.deblocking = 1;
		}
		else
		{
			_video.smoothing = true;
			_video.deblocking = 5;
		}
		
		_videoQualityHigh = _videoQualityHigh?false:true;
		
		return _videoQualityHigh;
	}
	
	/**
	 * Mutes or unmutes the sound
	 * @return true if muted false if unmuted
	 */
	public function toggleMute()
	{
		this.mute(!_soundMuted);
	}
	
	public function mute(goMuted:Bool)
	{
		var soundTransform:SoundTransform = new SoundTransform();
		
		
		//unmute sound
		if (!goMuted)
		{
			_soundMuted = false;
			
			soundTransform.volume = _volume;
		}
		
		//mute sound
		else
		{
			_soundMuted = true;
			_volume = _stream.soundTransform.volume;
			soundTransform.volume = 0;
			_stream.soundTransform = soundTransform;
			_userSettings.setVolume(0);
		}
		
		if (_streamType == StreamType.YOUTUBE)
		{
			if(this._ytReady){
				Reflect.field(_youtubeLoader.content, "setVolume")(soundTransform.volume * 100);
			}
		}
		else if (_type == InputType.VIDEO || _streamType == StreamType.RTMP)
		{
			_stream.soundTransform = soundTransform;
		}
		else if (_type == InputType.AUDIO)
		{
			_soundChannel.soundTransform = soundTransform;
			setVolume(_userSettings.getVolume());
		}
		
		callEvents(PlayerEvents.MUTE);
	}
	
	/**
	 * Check if player is running on fullscreen mode
	 * @return true if fullscreen false if not
	 */
	public function isFullscreen():Bool
	{
		return _stage.displayState == StageDisplayState.FULL_SCREEN;
	}
	
	
	//{Setters
	/**
	 * Set input type
	 * @param	type Allowable values are audio, video
	 */
	public function setType(type:String):Void
	{
		_type = type;
	}
	
	/**
	 * Set streaming type
	 * @param	streamType Allowable values are file, http, rmtp
	 */
	public function setStreamType(streamType:String):Void
	{
		_streamType = streamType;
	}
	
	/**
	 * Sets the server url for rtmp streams
	 * @param	server
	 */
	public function setServer(server:String):Void
	{
		_server = server;
	}
	
	/**
	 * To set the video source in case we dont want to start downloading at first so when use tooglePlay the
	 * media is loaded automatically
	 * @param	source
	 */
	public function setSource(source):Void
	{
		_mediaSource = source;
	}
	
	/**
	 * Changes the current volume
	 * @param	volume
	 */
	public function setVolume(volume:Float):Void
	{
		var soundTransform:SoundTransform = new SoundTransform();
		
		_volume = volume;
		
		soundTransform.volume = volume;
		
		if (!_firstLoad) //To prevent errors if objects aren't initialized
		{
			if (_streamType == StreamType.YOUTUBE)
			{
				Reflect.field(_youtubeLoader.content, "setVolume")(soundTransform.volume * 100);
			}
			else if (_type == InputType.VIDEO || _streamType == StreamType.RTMP)
			{
				_stream.soundTransform = soundTransform;
			}
			else if (_type == InputType.AUDIO)
			{
				_soundChannel.soundTransform = soundTransform;
			}
		}
		
		//Store volume into user settings
		_userSettings.setVolume(_volume);

		callEvents(PlayerEvents.VOLUME_CHANGE);
	}
	
	/**
	 * Changes the buffer time for local and pseudo streaming
	 * @param	time in seconds
	 */
	public function setBufferTime(time:Float):Void
	{
		if (time > 0)
		{
			_bufferTime = time;
		}
	}
	
	/**
	 * Show/Hide the Loader
	 * @param	true / false
	 */
	public function setLoader(val:Bool):Void
	{
		_showLoader = val;
	}
	
	/**
	 * Changes the aspec ratio of current playing media and resizes video player
	 * @param	aspectRatio new aspect ratio value
	 */
	public function setAspectRatio(aspectRatio:Float):Void
	{
		_aspectRatio = aspectRatio;
		
		switch(_aspectRatio)
		{
			case 0.0:
				_currentAspectRatio = "original";
				
			case AspectRatio._1_1:
				_currentAspectRatio = "1:1";
				
			case AspectRatio._3_2:
				_currentAspectRatio = "3:2";
				
			case AspectRatio._4_3:
				_currentAspectRatio = "4:3";
				
			case AspectRatio._5_4:
				_currentAspectRatio = "5:4";
				
			case AspectRatio._14_9:
				_currentAspectRatio = "14:9";
				
			case AspectRatio._14_10:
				_currentAspectRatio = "14:10";
				
			case AspectRatio._16_9:
				_currentAspectRatio = "16:9";
				
			case AspectRatio._16_10:
				_currentAspectRatio = "16:10";
		}
		
		resizeAndCenterPlayer();
		
		//Store aspect ratio into user settings
		_userSettings.setAspectRatio(_aspectRatio);
	}
	
	/**
	 * Enable or disable hardware scaling
	 * @param	value true to enable false to disable
	 */
	public function setHardwareScaling(value:Bool):Void
	{
		_useHardWareScaling = value;
	}
	//}
	
	
	//{Getters
	/**
	 * Gets the volume amount 0.0 to 1.0
	 * @return 
	 */
	public function getVolume():Float
	{
		return _volume;
	}
	
	/**
	 * The current aspect ratio of the loaded Player
	 * @return
	 */
	public function getAspectRatio():Float
	{
		return _aspectRatio;
	}
	
	/**
	 * The current aspect ratio of the loaded Player in string format
	 * @return
	 */
	public function getAspectRatioString():String
	{
		return _currentAspectRatio;
	}
	
	/**
	 * Original aspect ratio of the video
	 * @return original aspect ratio
	 */
	public function getOriginalAspectRatio():Float
	{
		return _originalAspectRatio;
	}
	
	/**
	 * Total duration time of the loaded media
	 * @return time in seconds
	 */
	public function getDuration():Float
	{
		return _mediaDuration;
	}
	
	/**
	 * The time in seconds where the player started downloading
	 * @return time in seconds
	 */
	public function getStartTime():Float
	{
		return _startTime;
	}
	
	/**
	 * The stream associated with the player
	 * @return netstream object
	 */
	public function getNetStream():NetStream
	{
		return _stream;
	}
	
	/**
	 * Video object associated to the player
	 * @return video object for further manipulation
	 */
	public function getVideo():Video
	{	
		return _video;
	}
	
	/**
	 * Sound object associated to the player
	 * @return sound object for further manipulation
	 */
	public function getSound():Sound
	{
		return _sound;
	}
	
	/**
	 * The id3 info of sound object
	 * @return
	 */
	public function getId3Info():ID3Info
	{
		return _id3Info;
	}
	
	/**
	 * The current sound state
	 * @return true if mute otherwise false
	 */
	public function getMute():Bool
	{
		return _soundMuted;
	}
	
	/**
	 * The amount of total bytes
	 * @return amount of bytes
	 */
	public function getBytesTotal():Float
	{
		var bytesTotal:Float = 0;
		
		if (_streamType == StreamType.YOUTUBE)
		{
			if(_youtubeLoader != null && _mediaLoaded)
			bytesTotal = Reflect.field(_youtubeLoader.content, "getVideoBytesTotal")();
		}
		else if (_type == InputType.VIDEO || _streamType == StreamType.RTMP)
		{
			bytesTotal = _stream.bytesTotal;
		}
		else if (_type == InputType.AUDIO)
		{
			bytesTotal = _sound.bytesTotal;
		}
		
		return bytesTotal;
	}
	
	/**
	 * The amount of bytes loaded
	 * @return amount of bytes
	 */
	public function getBytesLoaded():Float
	{
		var bytesLoaded:Float = 0;
		
		if (_streamType == StreamType.YOUTUBE)
		{
			if(_youtubeLoader != null && _mediaLoaded)
			bytesLoaded = Reflect.field(_youtubeLoader.content, "getVideoBytesLoaded")();
		}
		else if (_type == InputType.VIDEO || _streamType == StreamType.RTMP)
		{
			bytesLoaded = _stream.bytesLoaded;
		}
		else if (_type == InputType.AUDIO)
		{
			bytesLoaded = _sound.bytesLoaded;
		}
		
		return bytesLoaded;
	}
	
	/**
	 * Current playing file type
	 * @return audio or video
	 */
	public function getType():String
	{
		return _type;
	}
	
	/**
	 * The stream method for the current playing media
	 * @return
	 */
	public function getStreamType():String
	{
		return _streamType;
	}
	
	/**
	 * The server url for current rtmp stream
	 * @return
	 */
	public function getServer():String
	{
		return _server;
	}
	
	/**
	 * To check current quality mode
	 * @return true if high quality false if low
	 */
	public function getQuality():Bool
	{
		return _videoQualityHigh;
	}
	
	/**
	 * The current playing time
	 * @return current playing time in seconds
	 */
	public function getCurrentTime():Float
	{
		var time:Float = 0;
		if (_streamType == StreamType.YOUTUBE)
		{
			if(_youtubeLoader != null && _ytReady)
			{
				time = Reflect.field(_youtubeLoader.content, "getCurrentTime")();
			}
			else
			{
				time = 0;
			}
		}
		else if (_streamType == StreamType.PSEUDOSTREAM)
		{
			time = getStartTime() + _stream.time;
		}
		else if (_type == InputType.VIDEO || _streamType == StreamType.RTMP)
		{
			time = _stream.time;
		}
		else if (_type == InputType.AUDIO)
		{
			if(_soundChannel != null)
			{	
				time = _soundChannel.position / 1000;
			}
			else
			{
				time = 0;
			}
		}
		
		return time;
	}
	//}
	
	
	/**
	 * Return the load type
	 * @return
	 */
	public function getLoadType():Bool
	{
		return _preLoading;
	}
	
	public function hasPoster(val:Bool)
	{
		_hasPoster = val;
	}
	
}
