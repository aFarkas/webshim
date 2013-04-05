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

package jaris.player.newcontrols;

//{Libraries
import flash.display.GradientType;
import flash.events.Event;
import flash.events.TimerEvent;
import flash.geom.Matrix;
import flash.Lib;
import flash.events.MouseEvent;
import flash.display.MovieClip;
import flash.net.NetStream;
import flash.geom.Rectangle;
import flash.text.AntiAliasType;
import flash.text.TextField;
import flash.text.TextFieldAutoSize;
import flash.text.TextFormat;
import flash.utils.Timer;
import jaris.animation.Animation;
import jaris.events.PlayerEvents;
import jaris.player.newcontrols.Loader;
import jaris.player.newcontrols.FullscreenIcon;
import jaris.player.newcontrols.PauseIcon;
import jaris.player.newcontrols.PlayIcon;
import jaris.player.newcontrols.VolumeIcon;
import jaris.player.Player;
import flash.display.Sprite;
import flash.display.Stage;
import jaris.utils.Utils;
//}

/**
 * Default controls for jaris player
 */
class NewControls extends MovieClip {
	
	//{Member Variables
	private var _thumb:Sprite;
	private var _track:Sprite;
	private var _trackDownloaded:Sprite;
	private var _scrubbing:Bool;
	private var _stage:Stage;
	private var _movieClip:MovieClip;
	private var _player:Player;
	private var _darkColor:UInt;
	private var _brightColor:UInt;
	private var _seekColor:UInt;
	private var _controlColor:UInt;
	private var _controlSize:Int;
	private var _hoverColor:UInt;
	private var _hideControlsTimer:Timer;
	private var _hideAspectRatioLabelTimer:Timer;
	private var _currentPlayTimeLabel:TextField;
	private var _totalPlayTimeLabel:TextField;
	private var _percentLoaded:Float;
	private var _controlsVisible:Bool;
	private var _seekBar:Sprite;
	private var _controlsBar:Sprite;
	private var _playControl:PlayIcon;
	private var _pauseControl:PauseIcon;
	private var _fullscreenControl:FullscreenIcon;
	private var _volumeIcon:VolumeIcon;
	private var _volumeTrack:Sprite;
	private var _volumeSlider:Sprite;
	private var _loader:Loader;
	private var _aspectRatioLabelContainer:Sprite;
	private var _aspectRatioLabel:TextField;
	private var _textFormat:TextFormat;
	private var _forceHideControls:Bool;
	private var _shouldBeVisible:Bool;
	private var _nodeName:String;
	private var _showLoader:Bool;
	//}
	
	
	//{Constructor
	public function new(player:Player, forceHideControls, nodeName, showLoader )
	{
		super();
		
		//{Main variables
		_nodeName = nodeName;
		_stage = Lib.current.stage;
		_movieClip = Lib.current;
		_player = player;
		_darkColor = 0x000000;
		_brightColor = 0x4c4c4c;
		_controlColor = 0xFFFFFF;
		_hoverColor = 0x67A8C1;
		_seekColor = 0x7c7c7c;
		_controlSize = 40;
		_percentLoaded = 0.0;
		_hideControlsTimer = new Timer(500);
		_hideAspectRatioLabelTimer = new Timer(500);
		_controlsVisible = false;
		_showLoader = showLoader;
		
		_textFormat = new TextFormat();
		_textFormat.font = "arial";
		_textFormat.color = _controlColor;
		_textFormat.size = 14;
		//}
		
		//{Playing controls initialization
		_controlsBar = new Sprite();
		_controlsBar.visible = true;
		addChild(_controlsBar);
		
		_playControl = new PlayIcon(0, 0, 0, 0, _controlColor, _hoverColor);
		_controlsBar.addChild(_playControl);
		
		_pauseControl = new PauseIcon(0, 0, 0, 0, _controlColor, _hoverColor);
		_pauseControl.visible = false;
		_controlsBar.addChild(_pauseControl);
		
		
		if(_nodeName == 'video'){
			_fullscreenControl = new FullscreenIcon(0, 0, 0, 0, _controlColor, _hoverColor);
			_controlsBar.addChild(_fullscreenControl);
		}
		_volumeIcon = new VolumeIcon(0, 0, 0, 0, _controlColor, _hoverColor);
		_controlsBar.addChild(_volumeIcon);
		
		_volumeSlider = new Sprite();
		_volumeSlider.visible = false;
		_controlsBar.addChild(_volumeSlider);
		
		_volumeTrack = new Sprite();
		_volumeTrack.visible = false;
		_volumeTrack.buttonMode = true;
		_volumeTrack.useHandCursor = true;
		_volumeTrack.tabEnabled = false;
		_controlsBar.addChild(_volumeTrack); 
		//}
		
		//{Seeking Controls initialization
		_seekBar = new Sprite();
		_controlsBar.addChild(_seekBar);
		
		_trackDownloaded = new Sprite(  );
		_trackDownloaded.tabEnabled = false;
		_seekBar.addChild(_trackDownloaded);
		
		_track = new Sprite(  );
		_track.tabEnabled = false;
		_track.buttonMode = true;
		_track.useHandCursor = true;
		_seekBar.addChild(_track);
		
		_thumb = new Sprite(  );
		_thumb.buttonMode = true;
		_thumb.useHandCursor = true;
		_thumb.tabEnabled = false;
		_seekBar.addChild(_thumb);
		
		_currentPlayTimeLabel = new TextField();
		_currentPlayTimeLabel.autoSize = TextFieldAutoSize.LEFT;
		_currentPlayTimeLabel.text = "00:00:00";
		_currentPlayTimeLabel.tabEnabled = false;
		_currentPlayTimeLabel.setTextFormat(_textFormat);
		_seekBar.addChild(_currentPlayTimeLabel);
		
		_totalPlayTimeLabel = new TextField();
		_totalPlayTimeLabel.autoSize = TextFieldAutoSize.LEFT;
		_totalPlayTimeLabel.text = "00:00:00";
		_totalPlayTimeLabel.tabEnabled = false;
		_totalPlayTimeLabel.setTextFormat(_textFormat);
		_seekBar.addChild(_totalPlayTimeLabel);
		
		//}
		
		//{Aspect ratio label
		_aspectRatioLabelContainer = new Sprite();
		addChild(_aspectRatioLabelContainer);
		
		_aspectRatioLabel = new TextField();
		_aspectRatioLabel.autoSize = TextFieldAutoSize.CENTER;
		_aspectRatioLabel.text = "original";
		_aspectRatioLabel.tabEnabled = false;
		_aspectRatioLabelContainer.addChild(_aspectRatioLabel);
		//}
		
		redrawControls();
		
		
		_forceHideControls = forceHideControls == "false";
		
		
		//{Loader bar
		if ( _forceHideControls && _showLoader || !_forceHideControls ) {
			
			_loader = new Loader();
			_loader.hide();
			
			var loaderColors:Array <String> = ["", "", "", ""];
			loaderColors[0] = Std.string(_darkColor);
			loaderColors[1] = Std.string(_controlColor);
			loaderColors[2] = Std.string(_seekColor);
			
			_loader.setColors(loaderColors);
			
			addChild(_loader);
		}
		
		//}
		
		//{event Listeners
		_movieClip.addEventListener(Event.ENTER_FRAME, onEnterFrame);
		_thumb.addEventListener(MouseEvent.MOUSE_DOWN, onThumbMouseDown);
		_thumb.addEventListener(MouseEvent.MOUSE_UP, onThumbMouseUp);
		_thumb.addEventListener(MouseEvent.MOUSE_OVER, onThumbHover);
		_thumb.addEventListener(MouseEvent.MOUSE_OUT, onThumbMouseOut);
		_track.addEventListener(MouseEvent.CLICK, onTrackClick);
		_playControl.addEventListener(MouseEvent.CLICK, onPlayClick);
		_pauseControl.addEventListener(MouseEvent.CLICK, onPauseClick);
		if(_nodeName == 'video'){
			_fullscreenControl.addEventListener(MouseEvent.CLICK, onFullscreenClick);
		}
		
		_volumeIcon.addEventListener(MouseEvent.CLICK, onVolumeIconClick);
		_volumeTrack.addEventListener(MouseEvent.CLICK, onVolumeTrackClick);
		
		_player.addEventListener(PlayerEvents.MOUSE_HIDE, onPlayerMouseHide);
		_player.addEventListener(PlayerEvents.MOUSE_SHOW, onPlayerMouseShow);
		_player.addEventListener(PlayerEvents.MEDIA_INITIALIZED, onPlayerMediaInitialized);
		_player.addEventListener(PlayerEvents.BUFFERING, onPlayerBuffering);
		_player.addEventListener(PlayerEvents.NOT_BUFFERING, onPlayerNotBuffering);
		_player.addEventListener(PlayerEvents.RESIZE, onPlayerResize);
		_player.addEventListener(PlayerEvents.PLAY_PAUSE, onPlayerPlayPause);
		_player.addEventListener(PlayerEvents.PLAYBACK_FINISHED, onPlayerPlaybackFinished);
		_player.addEventListener(PlayerEvents.CONNECTION_FAILED, onPlayerStreamNotFound);
		_player.addEventListener(PlayerEvents.ASPECT_RATIO, onPlayerAspectRatio);
		
		_stage.addEventListener(MouseEvent.MOUSE_UP, onThumbMouseUp);
		_stage.addEventListener(MouseEvent.MOUSE_OUT, onThumbMouseUp);
		_stage.addEventListener(MouseEvent.MOUSE_MOVE, onMouseMove);
		_stage.addEventListener(Event.RESIZE, onStageResize);
		
		_hideControlsTimer.addEventListener(TimerEvent.TIMER, hideControlsTimer);
		_hideAspectRatioLabelTimer.addEventListener(TimerEvent.TIMER, hideAspectRatioLabelTimer);
		
		_hideControlsTimer.start();
		
		
		if (_forceHideControls) 
		{
			this.hideControls();
		}
		_shouldBeVisible = true;
		//}
	}
	//}

	
	//{Timers
	/**
	 * Hides the playing controls when not moving mouse.
	 * @param	event The timer event associated
	 */
	private function hideControlsTimer(event:TimerEvent):Void
	{
		if (_player.isPlaying())
		{
			if (_controlsVisible)
			{
				if (_stage.mouseX < _controlsBar.x || 
					_stage.mouseX >= _stage.stageWidth - 1 || 
					_stage.mouseY >= _stage.stageHeight - 1 ||
					_stage.mouseY <= 1
				   )
				{
					_controlsVisible = false;
				}
			}
			else
			{
				hideControls();
				_hideControlsTimer.stop();
			}
		}
	}
	
	/**
	 * Hides aspect ratio label
	 * @param	event
	 */
	private function hideAspectRatioLabelTimer(event:TimerEvent):Void
	{	
		//wait till fade in effect finish
		if (_aspectRatioLabelContainer.alpha >= 1)
		{
			Animation.fadeOut(_aspectRatioLabelContainer, 300);
			_hideAspectRatioLabelTimer.stop();
		}
	}
	//}
	
	
	//{Events
	/**
	 * Keeps syncronized various elements of the controls like the thumb and download track bar
	 * @param	event
	 */
	private function onEnterFrame(event:Event):Void
	{
		if(_player.getDuration() > 0) {
			if (_scrubbing) 
			{
				_player.seek(((_thumb.x - _track.x) / _track.width) * _player.getDuration());
			}
			else 
			{
				_currentPlayTimeLabel.text = Utils.formatTime(_player.getCurrentTime());
				_currentPlayTimeLabel.setTextFormat(_textFormat);
				_thumb.x = _player.getCurrentTime() / _player.getDuration() * (_track.width-_thumb.width) + _track.x;
			}
		}
		
		_volumeSlider.height = _volumeTrack.height * (_player.getVolume() / 1.0);
		_volumeSlider.y = (_volumeTrack.y + _volumeTrack.height) - _volumeSlider.height;
		
		drawDownloadProgress();
	}
	
	/**
	 * Show playing controls on mouse movement.
	 * @param	event
	 */
	private function onMouseMove(event:MouseEvent):Void
	{
		if(!_forceHideControls){
			if (_stage.mouseX >= _controlsBar.x)
			{
				if (!_hideControlsTimer.running)
				{
					_hideControlsTimer.start();
				}
				
				_controlsVisible = true;
				showControls();
			}
		}
	}
	
	/**
	 * Function fired by a stage resize eventthat redraws the player controls
	 * @param	event
	 */
	private function onStageResize(event:Event):Void
	{
		if(!_forceHideControls){
			redrawControls();
		}
	}
	
	/**
	 * Toggles pause or play
	 * @param	event
	 */
	private function onPlayClick(event:MouseEvent):Void
	{
		_player.togglePlay();
		_playControl.visible = !_player.isPlaying();
		_pauseControl.visible = _player.isPlaying();
	}
	
	/**
	 * Toggles pause or play
	 * @param	event
	 */
	private function onPauseClick(event:MouseEvent):Void
	{
		_player.togglePlay();
		_playControl.visible = !_player.isPlaying();
		_pauseControl.visible = _player.isPlaying();
	}
	
		
	/**
	 * Toggles between window and fullscreen mode
	 * @param	event
	 */
	private function onFullscreenClick(event:MouseEvent):Void
	{
		_player.toggleFullscreen();
	}
	
	/**
	 * Toggles between mute and unmute
	 * @param	event
	 */
	private function onVolumeIconClick(event: MouseEvent):Void
	{
		if (_volumeSlider.visible) {
			_volumeSlider.visible = false;
			_volumeTrack.visible = false;
		} else {
			_volumeSlider.visible = true;
			_volumeTrack.visible = true;
		}
	}
	
	/**
	 * Detect user click on volume track control and change volume according
	 * @param	event
	 */
	private function onVolumeTrackClick(event:MouseEvent):Void
	{
		var percent:Float = _volumeTrack.height - _volumeTrack.mouseY;
		var volume:Float = 1.0 * (percent / _volumeTrack.height);
		
		_player.setVolume(volume);
	}
	
	/**
	 * Display not found message
	 * @param	event
	 */
	private function onPlayerStreamNotFound(event:PlayerEvents):Void
	{
		//todo: to work on this
	}	
	
	/**
	 * Shows the loader bar when buffering
	 * @param	event
	 */
	private function onPlayerBuffering(event:PlayerEvents):Void
	{
		if ( _forceHideControls && _showLoader || !_forceHideControls ) _loader.show();
	}
	
	/**
	 * Hides loader bar when not buffering
	 * @param	event
	 */
	private function onPlayerNotBuffering(event:PlayerEvents):Void
	{
		if ( _forceHideControls && _showLoader || !_forceHideControls ) _loader.hide();
	}
	
	/**
	 * Show the selected aspect ratio
	 * @param	event
	 */
	private function onPlayerAspectRatio(event:PlayerEvents):Void
	{
		_hideAspectRatioLabelTimer.stop();
		_aspectRatioLabel.text = _player.getAspectRatioString();
		drawAspectRatioLabel();
		
		while (_aspectRatioLabelContainer.visible)
		{
			//wait till fade out finishes
		}
		
		Animation.fadeIn(_aspectRatioLabelContainer, 1);
		
		_hideAspectRatioLabelTimer.start();
	}
		
	/**
	 * Monitors playbeack when finishes tu update controls
	 * @param	event
	 */
	private function onPlayerPlaybackFinished(event:PlayerEvents):Void
	{
		_playControl.visible = !_player.isPlaying();
		_pauseControl.visible = _player.isPlaying();
		
		showControls();
	}
	
	/**
	 * Monitors keyboard play pause actions to update icons
	 * @param	event
	 */
	private function onPlayerPlayPause(event:PlayerEvents):Void
	{
		_playControl.visible = !_player.isPlaying();
		_pauseControl.visible = _player.isPlaying();
	}
	
	/**
	 * Resizes the video player on windowed mode substracting the seekbar height
	 * @param	event
	 */
	private function onPlayerResize(event:PlayerEvents):Void
	{
	}
	
	/**
	 * Updates media total time duration.
	 * @param	event
	 */
	private function onPlayerMediaInitialized(event:PlayerEvents):Void
	{	
		_totalPlayTimeLabel.text = Utils.formatTime(event.duration);
		_totalPlayTimeLabel.setTextFormat(_textFormat);
		
		_playControl.visible = !_player.isPlaying();
		_pauseControl.visible = _player.isPlaying();
	}
	
	/**
	 * Hides seekbar if on fullscreen.
	 * @param	event
	 */
	private function onPlayerMouseHide(event:PlayerEvents):Void
	{
		if (_controlsBar.visible && _player.isFullscreen())
		{
			hideControls();
		}
	}
	
	/**
	 * Shows seekbar
	 * @param	event
	 */
	private function onPlayerMouseShow(event:PlayerEvents):Void
	{
		
		if (!_controlsBar.visible)
		{
			if (!_forceHideControls) {
				_controlsBar.visible = true;
			} else {
				_shouldBeVisible = true;
			}
			
		}
	}
	
	/**
	 * Translates a user click in to time and seeks to it
	 * @param	event
	 */
	private function onTrackClick(event:MouseEvent):Void
	{
		var clickPosition:Float = _track.mouseX;
		_player.seek(_player.getDuration() * (clickPosition / _track.width));
	}
		
	
	/**
	 * Enables dragging of thumb for seeking media
	 * @param	event
	 */
	private function onThumbMouseDown(event:MouseEvent):Void
	{
		_scrubbing = true;
		var rectangle:Rectangle = new Rectangle(_track.x, _track.y, _track.width-_thumb.width, 0);
		_thumb.startDrag(false, rectangle);
	}
	
	/**
	 * Changes thumb seek control to hover color
	 * @param	event
	 */
	private function onThumbHover(event:MouseEvent):Void
	{
		_thumb.graphics.lineStyle();
		_thumb.graphics.beginFill(_hoverColor);
		_thumb.graphics.drawRoundRect(0, (_seekBar.height/2)-(11/2), 11, 11, 10, 10);
		_thumb.graphics.endFill();
	}
	
	/**
	 * Changes thumb seek control to control color
	 * @param	event
	 */
	private function onThumbMouseOut(event:MouseEvent):Void
	{
		var matrix:Matrix = new Matrix(  );
		matrix.createGradientBox(11, 11, Utils.degreesToRadians(-90), 11, 0);
		var colors:Array<UInt> = [_controlColor, _controlColor];
		var alphas:Array<Float> = [0.75, 1];
		var ratios:Array<UInt> = [0, 255];
		
		_thumb.graphics.beginGradientFill(GradientType.LINEAR, colors, alphas, ratios, matrix);
		_thumb.graphics.drawRoundRect(0, (_seekBar.height / 2) - (11 / 2), 11, 11, 10, 10);
		_thumb.graphics.endFill();
	}
	
	/**
	 * Disables dragging of thumb
	 * @param	event
	 */
	private function onThumbMouseUp(event:MouseEvent):Void
	{
		_scrubbing = false;
		_thumb.stopDrag(  );
	}
	//}
	
	
	//{Drawing functions
	/**
	 * Clears all current graphics a draw new ones
	 */
	private function redrawControls():Void
	{	
		drawControls();
		drawAspectRatioLabel();
	}
	
	/**
	 * Draws the download progress track bar
	 */
	private function drawDownloadProgress():Void
	{
		if (_player.getBytesTotal() > 0)
		{
			var bytesLoaded:Float = _player.getBytesLoaded();
			var bytesTotal:Float = _player.getBytesTotal();
			
			_percentLoaded = bytesLoaded / bytesTotal;
		}
		
		var position:Float = _player.getStartTime() / _player.getDuration();
		var startPosition:Float = (position > 0?(position * _track.width):0) + _track.x;
		
		_trackDownloaded.graphics.clear();
		_trackDownloaded.graphics.lineStyle();
		_trackDownloaded.x = startPosition;
		_trackDownloaded.graphics.beginFill(_seekColor, 0.5);
		_trackDownloaded.graphics.drawRoundRect(0, (_seekBar.height / 2) - (5 / 2), ((_track.width + _track.x) - _trackDownloaded.x) * _percentLoaded, 5, 3, 3);
		_trackDownloaded.graphics.endFill();
	}
	
	/**
	 * Draws NEW control bar player/seek controls
	 */
	private function drawControls():Void
	{
		//Reset sprites for redraw
		_controlsBar.graphics.clear();
		_volumeTrack.graphics.clear();
		_volumeSlider.graphics.clear();
		_volumeSlider.visible = false;
		_volumeTrack.visible = false;
		
		//Reset sprites for redraw
		_seekBar.graphics.clear();
		_track.graphics.clear();
		_thumb.graphics.clear();
		
		//Draw controls bar
		var barMargin = 10;
		var barWidth = _stage.stageWidth;
		var barHeight = _controlSize;
		var barCenter = barWidth / 2;
		var buttonSize = Std.int(((80 / 100) * (barHeight - (barMargin*2))));
		var buttonCount = (_nodeName == 'video') ? 2 : 1;
		_controlsBar.x = 0;
		_controlsBar.y = (_stage.stageHeight - barHeight);
		
		var matrix:Matrix = new Matrix(  );
		matrix.createGradientBox(barWidth, barHeight, Utils.degreesToRadians(-90), barWidth, 0);
		var colors:Array<UInt> = [_brightColor, _darkColor];
		var alphas:Array<Float> = [1.0, 1];
		var ratios:Array<UInt> = [0, 255];
		_controlsBar.graphics.lineStyle();
		_controlsBar.graphics.beginGradientFill(GradientType.LINEAR, colors, alphas, ratios, matrix);
		_controlsBar.graphics.drawRect(0, 2, barWidth, barHeight-2);
		_controlsBar.graphics.endFill();
		_controlsBar.graphics.beginFill(_darkColor, 1);
		_controlsBar.graphics.drawRect(0, 0, barWidth, 1);
		_controlsBar.graphics.endFill();
		_controlsBar.graphics.beginFill(_brightColor, 1);
		_controlsBar.graphics.drawRect(0, 1, barWidth, 1);
		_controlsBar.graphics.endFill();
		
		//Draw seek bar
		var _seekBarWidth = barWidth - (buttonSize+barMargin)*buttonCount - (_playControl.x + _playControl.width + barMargin) - barMargin;
		var _seekBarHeight = barHeight;
		_seekBar.x = _playControl.x + _playControl.width + barMargin;
		_seekBar.y = 0;
		_seekBar.graphics.lineStyle();
		_seekBar.graphics.beginFill(_darkColor, 0);
		_seekBar.graphics.drawRect(0, 0, _seekBarWidth, _seekBarHeight);
		_seekBar.graphics.endFill();

		//Draw playbutton
		_playControl.setNormalColor(_controlColor);
		_playControl.setHoverColor(_hoverColor);
		_playControl.setPosition(barMargin, barMargin);
		_playControl.setSize(buttonSize+5, buttonSize+5);
		
		//Draw pausebutton
		_pauseControl.setNormalColor(_controlColor);
		_pauseControl.setHoverColor(_hoverColor);
		_pauseControl.setPosition(_playControl.x, _playControl.y);
		_pauseControl.setSize(buttonSize+5, buttonSize+5);

		//Draw current play time label
		_textFormat.color = _seekColor;
		_currentPlayTimeLabel.x = 0;
		_currentPlayTimeLabel.y = _seekBarHeight - (_seekBarHeight / 2) - (_currentPlayTimeLabel.height / 2);
		_currentPlayTimeLabel.antiAliasType = AntiAliasType.ADVANCED;
		_currentPlayTimeLabel.setTextFormat(_textFormat);
		
		//Draw total play time label
		_totalPlayTimeLabel.x = _seekBarWidth - _totalPlayTimeLabel.width;
		_totalPlayTimeLabel.y = _seekBarHeight - (_seekBarHeight / 2) - (_totalPlayTimeLabel.height / 2);
		_totalPlayTimeLabel.antiAliasType = AntiAliasType.ADVANCED;
		_totalPlayTimeLabel.setTextFormat(_textFormat);
		
		//Draw download progress
		drawDownloadProgress();
		
		//Draw track place holder for drag
		_track.x = _currentPlayTimeLabel.x + _currentPlayTimeLabel.width + barMargin;
		_track.graphics.lineStyle();
		_track.graphics.beginFill(_seekColor, 0);
		_track.graphics.drawRect(0, (_seekBarHeight / 2) - ((buttonSize+barMargin) / 2), _totalPlayTimeLabel.x - _totalPlayTimeLabel.width - barMargin - barMargin, buttonSize + barMargin);
		_track.graphics.endFill();
		
		_track.graphics.lineStyle();
		_track.graphics.beginFill(_seekColor, 0.3);
		_track.graphics.drawRoundRect(0, (_seekBarHeight / 2) - (5 / 2), _totalPlayTimeLabel.x - _totalPlayTimeLabel.width - barMargin - barMargin, 5, 3, 3);
		_track.graphics.endFill();
		
		//Draw thumb
		var matrix:Matrix = new Matrix(  );
		matrix.createGradientBox(11, 11, Utils.degreesToRadians(-90), 11, 0);
		var colors:Array<UInt> = [_controlColor, _controlColor];
		var alphas:Array<Float> = [0.75, 1];
		var ratios:Array<UInt> = [0, 255];
		
		_thumb.x = _currentPlayTimeLabel.width + _currentPlayTimeLabel.x + barMargin;
		_thumb.graphics.lineStyle();
		_thumb.graphics.beginGradientFill(GradientType.LINEAR, colors, alphas, ratios, matrix);
		//_thumb.graphics.beginFill(_controlColor);
		_thumb.graphics.drawRoundRect(0, (_seekBarHeight/2)-(11/2), 11, 11, 10, 10);
		_thumb.graphics.endFill();
		
		//Draw volume icon
		_volumeIcon.setNormalColor(_controlColor);
		_volumeIcon.setHoverColor(_hoverColor);
		_volumeIcon.setPosition(_seekBar.x + _seekBar.width + barMargin, _playControl.y+1);
		_volumeIcon.setSize(buttonSize, buttonSize);
		
				
		//Draw fullscreen button
		if(_nodeName == 'video'){
			_fullscreenControl.setNormalColor(_controlColor);
			_fullscreenControl.setHoverColor(_hoverColor);
			_fullscreenControl.setPosition(_volumeIcon.x + _volumeIcon.width + barMargin, _playControl.y+1);
			_fullscreenControl.setSize(buttonSize, buttonSize);
		}
		
		
		//Draw volume track
		_volumeTrack.x = _controlsBar.width-(buttonSize+barMargin)*buttonCount;
		_volumeTrack.y = -_controlsBar.height-2;
		_volumeTrack.graphics.lineStyle(1, _controlColor);
		_volumeTrack.graphics.beginFill(0x000000, 0);
		_volumeTrack.graphics.drawRect(0, 0, buttonSize, _controlsBar.height);
		_volumeTrack.graphics.endFill();
		
		//Draw volume slider
		var matrix:Matrix = new Matrix(  );
		matrix.createGradientBox(_volumeTrack.width, _volumeTrack.height, Utils.degreesToRadians(-90), _volumeTrack.width, 0);
		var colors:Array<UInt> = [_hoverColor, _hoverColor];
		var alphas:Array<Float> = [0.75, 1];
		var ratios:Array<UInt> = [0, 255];
		
		_volumeSlider.x = _volumeTrack.x;
		_volumeSlider.y = _volumeTrack.y;
		_volumeSlider.graphics.lineStyle();
		_volumeSlider.graphics.beginGradientFill(GradientType.LINEAR, colors, alphas, ratios, matrix);
		//_volumeSlider.graphics.beginFill(_hoverColor, 1);
		_volumeSlider.graphics.drawRect(0, 0, _volumeTrack.width, _volumeTrack.height);
		_volumeSlider.graphics.endFill();
		
	}
	
	private function drawAspectRatioLabel():Void
	{
		_aspectRatioLabelContainer.graphics.clear();
		_aspectRatioLabelContainer.visible = false;
		
		//Update aspect ratio label
		var textFormat:TextFormat = new TextFormat();
		textFormat.font = "arial";
		textFormat.bold = true;
		textFormat.size = 40;
		textFormat.color = _controlColor;
		
		_aspectRatioLabel.setTextFormat(textFormat);
		_aspectRatioLabel.x = (_stage.stageWidth / 2) - (_aspectRatioLabel.width / 2);
		_aspectRatioLabel.y = (_stage.stageHeight / 2) - (_aspectRatioLabel.height / 2);
		
		//Draw aspect ratio label container
		_aspectRatioLabelContainer.x = _aspectRatioLabel.x - 10;
		_aspectRatioLabelContainer.y = _aspectRatioLabel.y - 10;
		_aspectRatioLabelContainer.graphics.lineStyle(0, _darkColor);
		_aspectRatioLabelContainer.graphics.beginFill(_darkColor, 1);
		_aspectRatioLabelContainer.graphics.drawRoundRect(0, 0, _aspectRatioLabel.width + 20, _aspectRatioLabel.height + 20, 15, 15);
		_aspectRatioLabelContainer.graphics.endFill();
		
		_aspectRatioLabel.x = 10;
		_aspectRatioLabel.y = 10;
	}
	//}
	
	
	//{Private Methods
	/**
	 * Hide the play controls bar
	 */
	private function hideControls():Void
	{
		if(_controlsBar.visible)
		{
			if (_forceHideControls) {
				_controlsBar.visible = false;
			} else if(_nodeName == 'video') {
				drawControls();
				Animation.slideOut(_controlsBar, "bottom", 800);
			}
		}
		_shouldBeVisible = false;
	}
	
	public function forceControls(controls:Bool):Void
	{
		if(controls){
			_forceHideControls = false;
			if(_shouldBeVisible){
				showControls();
			}
		} else {
			_forceHideControls = true;
			_controlsBar.visible = false;
		}
	}
		
	/**
	 * Shows play controls bar
	 */
	private function showControls():Void
	{
		if(!_forceHideControls && !_controlsBar.visible)
		{
			drawControls();
			_controlsBar.visible = true;
		}
		_shouldBeVisible = true;
	}
	//}
	
	
	//{Setters
	/**
	 * Sets the player colors and redraw them
	 * @param	colors Array of colors in the following order: darkColor, brightColor, controlColor, hoverColor
	 */
	public function setControlColors(colors:Array<String>):Void
	{
		_darkColor = colors[0].length > 0? Std.parseInt("0x" + colors[0]) : 0x000000;
		_brightColor = colors[1].length > 0? Std.parseInt("0x" + colors[1]) : 0x4c4c4c;
		_controlColor = colors[2].length > 0? Std.parseInt("0x" + colors[2]) : 0xFFFFFF;
		_hoverColor = colors[3].length > 0? Std.parseInt("0x" + colors[3]) : 0x67A8C1;
		_seekColor = colors[4].length > 0? Std.parseInt("0x" + colors[4]) : 0x7c7c7c;
		
		
		var loaderColors:Array <String> = ["", ""];
		loaderColors[0] = colors[0];
		loaderColors[1] = colors[2];
		loaderColors[2] = colors[4];
		if ( _forceHideControls && _showLoader || !_forceHideControls ) _loader.setColors(loaderColors);
		
		redrawControls();
	}
	
	/**
	 * Sets the player controls size (height)
	 * @param	size int: for e.g. 50
	 */
	public function setControlSize(size:Int):Void
	{
		if (size == 0)
			return;
		
		_controlSize = size;
		redrawControls();
	}
	
	/**
	 * To set the duration label when autostart parameter is false
	 * @param	duration in seconds or formatted string in format hh:mm:ss
	 */
	public function setDurationLabel(duration:String):Void
	{
		//Person passed time already formatted
		if (duration.indexOf(":") != -1)
		{
			_totalPlayTimeLabel.text = duration;
		}
		
		//Time passed in seconds
		else
		{
			_totalPlayTimeLabel.text = Std.string(Utils.formatTime(Std.parseFloat(duration)));
		}
		
		_totalPlayTimeLabel.setTextFormat(_textFormat);
	}
	//}
	
}