import { useMemo } from 'react';
import { View } from 'react-native';
import Svg, { Circle, Ellipse, Path, Text as SvgText } from 'react-native-svg';
import Animated, { useReducedMotion } from 'react-native-reanimated';

// Maskot PASARIN (diport dari pasarin-maskot.svg). Animasi aslinya (melayang, melambai,
// berkedip, kilau, bayangan) dijalankan lewat Reanimated CSS animation di thread UI.
const VB_W = 400;
const VB_H = 440;

function Shadow() {
  return <Ellipse cx={200} cy={392} rx={90} ry={12} fill="#000" fillOpacity={0.25} />;
}
function Body() {
  return (
    <>
      <Path d="M150 130 C150 60, 250 60, 250 130" fill="none" stroke="#E8501A" strokeWidth={14} strokeLinecap="round" />
      <Path d="M105 130 H295 L315 360 Q316 380 296 380 H104 Q84 380 85 360 Z" fill="#FF6B35" />
      <Path d="M105 130 H295 L299 175 H101 Z" fill="#FF8A5B" />
      <Path d="M92 250 Q60 270 70 300" fill="none" stroke="#FF6B35" strokeWidth={16} strokeLinecap="round" />
    </>
  );
}
function WaveArm() {
  return (
    <>
      <Path d="M292 250 Q335 235 345 195" fill="none" stroke="#FF6B35" strokeWidth={16} strokeLinecap="round" />
      <Circle cx={346} cy={190} r={12} fill="#FFD7C2" />
    </>
  );
}
function Eyes() {
  return (
    <>
      <Ellipse cx={160} cy={215} rx={17} ry={22} fill="#fff" />
      <Ellipse cx={240} cy={215} rx={17} ry={22} fill="#fff" />
      <Circle cx={164} cy={220} r={10} fill="#2B2D42" />
      <Circle cx={244} cy={220} r={10} fill="#2B2D42" />
      <Circle cx={168} cy={215} r={3.5} fill="#fff" />
      <Circle cx={248} cy={215} r={3.5} fill="#fff" />
    </>
  );
}
function Face() {
  return (
    <>
      <Ellipse cx={133} cy={254} rx={13} ry={8} fill="#FF4D6D" opacity={0.45} />
      <Ellipse cx={267} cy={254} rx={13} ry={8} fill="#FF4D6D" opacity={0.45} />
      <Path d="M180 258 Q200 282 220 258 Z" fill="#2B2D42" />
      <Path d="M190 268 Q200 276 210 268 Q200 263 190 268 Z" fill="#FF7A90" />
      <Circle cx={200} cy={335} r={24} fill="#fff" />
      <SvgText x={200} y={346} textAnchor="middle" fontWeight="900" fontSize={32} fill="#FF6B35">
        P
      </SvgText>
    </>
  );
}
function Sparkle() {
  return <Path d="M330 100 L336 116 L352 122 L336 128 L330 144 L324 128 L308 122 L324 116 Z" fill="#FFC53D" />;
}

// Setiap lapisan memakai SATU objek style (posisi + animasi), sesuai tipe resmi Reanimated CSS animation
function buildAnimations(k, layer) {
  const loop = { animationIterationCount: 'infinite', animationTimingFunction: 'ease-in-out' };
  const withLayer = (animation) => ({ ...layer, ...animation });
  return {
    shadow: withLayer({
      ...loop,
      animationDuration: '2.4s',
      animationName: {
        '0%': { transform: [{ scaleX: 1 }], opacity: 1 },
        '50%': { transform: [{ scaleX: 0.8 }], opacity: 0.6 },
        '100%': { transform: [{ scaleX: 1 }], opacity: 1 },
      },
    }),
    float: withLayer({
      ...loop,
      animationDuration: '2.4s',
      animationName: {
        '0%': { transform: [{ translateY: 0 }] },
        '50%': { transform: [{ translateY: -12 * k }] },
        '100%': { transform: [{ translateY: 0 }] },
      },
    }),
    wave: withLayer({
      ...loop,
      animationDuration: '1.1s',
      transformOrigin: `${292 * k}px ${250 * k}px`,
      animationName: {
        '0%': { transform: [{ rotate: '0deg' }] },
        '50%': { transform: [{ rotate: '-28deg' }] },
        '100%': { transform: [{ rotate: '0deg' }] },
      },
    }),
    blink: withLayer({
      animationIterationCount: 'infinite',
      animationTimingFunction: 'linear',
      animationDuration: '4s',
      transformOrigin: `${200 * k}px ${215 * k}px`,
      animationName: {
        '0%': { transform: [{ scaleY: 1 }] },
        '92%': { transform: [{ scaleY: 1 }] },
        '95%': { transform: [{ scaleY: 0.1 }] },
        '100%': { transform: [{ scaleY: 1 }] },
      },
    }),
    spark: withLayer({
      ...loop,
      animationDuration: '1.8s',
      transformOrigin: `${330 * k}px ${120 * k}px`,
      animationName: {
        '0%': { transform: [{ scale: 0.6 }], opacity: 0.4 },
        '50%': { transform: [{ scale: 1.1 }], opacity: 1 },
        '100%': { transform: [{ scale: 0.6 }], opacity: 0.4 },
      },
    }),
  };
}

export default function Mascot({ size = 160, animated = true, style, accessibilityLabel = 'Maskot PASARIN' }) {
  const reduced = useReducedMotion();
  const k = size / VB_W;
  const height = (size * VB_H) / VB_W;
  const layer = useMemo(() => ({ position: 'absolute', left: 0, top: 0, width: size, height }), [size, height]);
  const anim = useMemo(() => buildAnimations(k, layer), [k, layer]);
  const svgProps = { width: size, height, viewBox: `0 0 ${VB_W} ${VB_H}` };

  if (!animated || reduced) {
    return (
      <View style={[{ width: size, height }, style]} accessible accessibilityRole="image" accessibilityLabel={accessibilityLabel}>
        <Svg {...svgProps}>
          <Shadow />
          <Body />
          <WaveArm />
          <Face />
          <Eyes />
          <Sparkle />
        </Svg>
      </View>
    );
  }

  return (
    <View style={[{ width: size, height }, style]} accessible accessibilityRole="image" accessibilityLabel={accessibilityLabel}>
      <Animated.View style={anim.shadow}>
        <Svg {...svgProps}>
          <Shadow />
        </Svg>
      </Animated.View>
      <Animated.View style={anim.float}>
        <Svg {...svgProps} style={layer}>
          <Body />
        </Svg>
        <Animated.View style={anim.wave}>
          <Svg {...svgProps}>
            <WaveArm />
          </Svg>
        </Animated.View>
        <Svg {...svgProps} style={layer}>
          <Face />
        </Svg>
        <Animated.View style={anim.blink}>
          <Svg {...svgProps}>
            <Eyes />
          </Svg>
        </Animated.View>
      </Animated.View>
      <Animated.View style={anim.spark}>
        <Svg {...svgProps}>
          <Sparkle />
        </Svg>
      </Animated.View>
    </View>
  );
}

// Versi kecil (hanya tas, tanpa bayangan) untuk header
export function MascotMark({ size = 30 }) {
  return (
    <Svg width={size} height={size} viewBox="60 50 300 340" accessibilityLabel="Logo PASARIN">
      <Body />
      <WaveArm />
      <Face />
      <Eyes />
      <Sparkle />
    </Svg>
  );
}
