import { createElements } from "./util";

const channelWidth = 5;

export interface LedButton extends MR_Button {
  mLedValue: MR_SurfaceCustomValueVariable;
}

export function createSurfaceElements(surface: MR_DeviceSurface, channelCount: number) {
  const channelsWidth = channelCount * channelWidth;
  const getChannelXPosition = (channelIndex: number) => channelIndex * channelWidth;

  surface.makeBlindPanel(0, 0, channelsWidth + 26, 40); // Frame
  surface.makeBlindPanel(channelsWidth + 1, 6, 23.25, 4); // Time display

  let ledButtonCounter = 0;
  const makeLedButton = (x: number, y: number, w: number, h: number) => {
    const button = surface.makeButton(x, y, w, h) as LedButton;
    button.mLedValue = surface.makeCustomValueVariable(`LedButton${++ledButtonCounter}`);
    return button;
  };

  const makeSquareButton = (x: number, y: number) => makeLedButton(x + 0.25, y, 1.5, 1.5);

  const miscControlButtons = createElements(21, (index) =>
    makeSquareButton(
      channelsWidth + 6 + (index % 7) * 2.625,
      17 + Math.floor(index / 7) * 2.5 + (index < 14 ? 0 : 0.5)
    )
  );
  const getMiscControlButtons = (indices: number[]) =>
    indices.map((index) => miscControlButtons[index]);

  return {
    channels: createElements(channelCount, (index) => {
      const encoder = surface.makePushEncoder(getChannelXPosition(index) + 1, 3, 4, 4);
      surface.makeLabelField(getChannelXPosition(index) + 1, 7, 4, 2).relateTo(encoder);

      return {
        index,
        encoder,
        encoderDisplayMode: surface.makeCustomValueVariable("encoderDisplayMode"),
        scribbleStrip: {
          encoderParameterName: surface.makeCustomValueVariable(
            "scribbleStripEncoderParameterName"
          ),
          trackTitle: surface.makeCustomValueVariable("scribbleStriptrackTitle"),
        },
        vuMeter: surface.makeCustomValueVariable("vuMeter"),
        buttons: {
          record: makeSquareButton(2 + getChannelXPosition(index), 10),
          solo: makeSquareButton(2 + getChannelXPosition(index), 12),
          mute: makeSquareButton(2 + getChannelXPosition(index), 14),
          select: makeLedButton(2 + getChannelXPosition(index), 16, 2, 1.5),
        },

        fader: surface.makeFader(2 + getChannelXPosition(index), 20, 2, 16),
        faderTouched: surface.makeCustomValueVariable("faderTouched"),
      };
    }),

    control: {
      mainFader: surface.makeFader(channelsWidth + 2, 20, 2, 16),
      mainFaderTouched: surface.makeCustomValueVariable("mainFaderTouched"),

      jogWheel: surface.makeKnob(channelsWidth + 13, 29.25, 8.5, 8.5),
      jogRight: surface.makeCustomValueVariable("jogRight"),
      jogLeft: surface.makeCustomValueVariable("jogLeft"),

      buttons: {
        display: makeSquareButton(channelsWidth + 2, 7.25),
        timeMode: makeSquareButton(channelsWidth + 21.75, 7.25),
        edit: makeLedButton(channelsWidth + 2, 10.5, 2, 1.5),
        flip: makeLedButton(channelsWidth + 2, 16, 2, 1.5),
        scrub: makeSquareButton(channelsWidth + 21.75, 28),

        encoderAssign: createElements(6, (index) =>
          makeSquareButton(channelsWidth + 2 + index * 2.25, 3.5)
        ),
        number: createElements(8, (index) =>
          makeSquareButton(channelsWidth + 6 + index * 2.25, 10.5)
        ),
        function: createElements(8, (index) =>
          makeSquareButton(channelsWidth + 6 + index * 2.25, 14)
        ),
        modify: getMiscControlButtons([0, 1, 7, 8]),
        automation: getMiscControlButtons([2, 3, 4, 9, 10, 11]),
        utility: getMiscControlButtons([5, 6, 12, 13]),
        transport: [
          ...miscControlButtons.slice(14),
          ...createElements(5, (index) =>
            makeLedButton(channelsWidth + 6.25 + index * 3.56, 25, 3, 2)
          ),
        ],

        navigation: {
          bank: {
            left: makeSquareButton(channelsWidth + 6.75, 28),
            right: makeSquareButton(channelsWidth + 9.25, 28),
          },
          channel: {
            left: makeSquareButton(channelsWidth + 6.75, 30),
            right: makeSquareButton(channelsWidth + 9.25, 30),
          },
          directions: {
            left: makeSquareButton(channelsWidth + 6.25, 34),
            right: makeSquareButton(channelsWidth + 9.75, 34),
            up: makeSquareButton(channelsWidth + 8, 32.25),
            center: makeSquareButton(channelsWidth + 8, 34),
            down: makeSquareButton(channelsWidth + 8, 35.75),
          },
        },
      },
    },

    display: {
      setAssignment(context: MR_ActiveDevice, assignment: string) {},
      onTimeUpdated: (context: MR_ActiveDevice, time: string, timeFormat: string) => {},
      leds: {
        smpte: surface.makeLamp(channelsWidth + 21.25, 6.5, 0.75, 0.5),
        beats: surface.makeLamp(channelsWidth + 21.25, 9, 0.75, 0.5),
        solo: surface.makeLamp(channelsWidth + 7.75, 7.75, 0.75, 0.5),
      },
      isValueModeActive: surface.makeCustomValueVariable("displayIsValueModeActive"),
    },
  };
}

export type SurfaceElements = ReturnType<typeof createSurfaceElements>;
