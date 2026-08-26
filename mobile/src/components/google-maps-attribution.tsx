import { Image } from "expo-image";
import { View } from "react-native";

const googleMapsLogo = require("../../assets/google-maps-attribution.svg");

export function GoogleMapsAttribution() {
  return (
    <View style={{ alignSelf: "flex-start", paddingLeft: 10, paddingRight: 10, paddingTop: 10, paddingBottom: 5 }}>
      <Image
        source={googleMapsLogo}
        accessibilityLabel="Google Maps"
        style={{ width: 98, height: 18 }}
        contentFit="contain"
      />
    </View>
  );
}
