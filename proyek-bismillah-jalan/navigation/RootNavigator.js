import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { useApp } from '../state/AppContext';
import { colors } from '../theme';

import LoginScreen from '../screens/LoginScreen';
import RegisterScreen from '../screens/RegisterScreen';
import HomeScreen from '../screens/HomeScreen';
import CategoriesScreen from '../screens/CategoriesScreen';
import CartScreen from '../screens/CartScreen';
import AccountScreen from '../screens/AccountScreen';
import SearchScreen from '../screens/SearchScreen';
import ProductDetailScreen from '../screens/ProductDetailScreen';
import ReviewFormScreen from '../screens/ReviewFormScreen';
import CheckoutScreen from '../screens/CheckoutScreen';
import OrderSuccessScreen from '../screens/OrderSuccessScreen';
import OrdersScreen from '../screens/OrdersScreen';
import OrderDetailScreen from '../screens/OrderDetailScreen';
import WishlistScreen from '../screens/WishlistScreen';
import AddressesScreen from '../screens/AddressesScreen';
import AddressFormScreen from '../screens/AddressFormScreen';
import EditProfileScreen from '../screens/EditProfileScreen';
import MyStoreScreen from '../screens/MyStoreScreen';
import StoreFormScreen from '../screens/StoreFormScreen';
import ProductFormScreen from '../screens/ProductFormScreen';
import PromosScreen from '../screens/PromosScreen';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

const tabIcon = (active, inactive) => ({ color, focused }) => <Ionicons name={focused ? active : inactive} size={24} color={color} />;

function MainTabs() {
  const { cartCount } = useApp();
  return (
    <Tab.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: colors.surface },
        headerShadowVisible: false,
        headerTitleStyle: { fontWeight: '800', color: colors.ink },
        tabBarActiveTintColor: colors.brandText,
        tabBarInactiveTintColor: colors.inkMute,
        tabBarLabelStyle: { fontSize: 12, fontWeight: '700' },
        tabBarStyle: { backgroundColor: colors.surface, borderTopColor: colors.line },
        sceneStyle: { backgroundColor: colors.canvas },
      }}
    >
      <Tab.Screen name="Beranda" component={HomeScreen} options={{ headerShown: false, tabBarIcon: tabIcon('home', 'home-outline'), tabBarButtonTestID: 'tab-beranda' }} />
      <Tab.Screen name="Kategori" component={CategoriesScreen} options={{ tabBarIcon: tabIcon('grid', 'grid-outline'), tabBarButtonTestID: 'tab-kategori' }} />
      <Tab.Screen
        name="Keranjang"
        component={CartScreen}
        options={{
          tabBarIcon: tabIcon('cart', 'cart-outline'),
          tabBarBadge: cartCount > 0 ? cartCount : undefined,
          tabBarBadgeStyle: { backgroundColor: colors.brand, color: colors.onBrand, fontWeight: '800' },
          tabBarButtonTestID: 'tab-keranjang',
        }}
      />
      <Tab.Screen name="Akun" component={AccountScreen} options={{ tabBarIcon: tabIcon('person', 'person-outline'), tabBarButtonTestID: 'tab-akun' }} />
    </Tab.Navigator>
  );
}

export default function RootNavigator({ initialRouteName }) {
  return (
    <Stack.Navigator
      initialRouteName={initialRouteName}
      screenOptions={{
        headerStyle: { backgroundColor: colors.surface },
        headerShadowVisible: false,
        headerTintColor: colors.ink,
        headerTitleStyle: { fontWeight: '800', color: colors.ink },
        headerBackButtonDisplayMode: 'minimal',
        contentStyle: { backgroundColor: colors.canvas },
      }}
    >
      <Stack.Screen name="Login" component={LoginScreen} options={{ headerShown: false }} />
      <Stack.Screen name="Register" component={RegisterScreen} options={{ title: 'Daftar Akun' }} />
      <Stack.Screen name="Main" component={MainTabs} options={{ headerShown: false }} />
      <Stack.Screen name="Search" component={SearchScreen} options={{ headerShown: false }} />
      <Stack.Screen name="ProductDetail" component={ProductDetailScreen} options={{ title: 'Detail Produk' }} />
      <Stack.Screen name="ReviewForm" component={ReviewFormScreen} options={{ title: 'Ulasan', presentation: 'modal' }} />
      <Stack.Screen name="Checkout" component={CheckoutScreen} options={{ title: 'Checkout' }} />
      <Stack.Screen name="OrderSuccess" component={OrderSuccessScreen} options={{ headerShown: false, gestureEnabled: false }} />
      <Stack.Screen name="Orders" component={OrdersScreen} options={{ title: 'Pesanan Saya' }} />
      <Stack.Screen name="OrderDetail" component={OrderDetailScreen} options={{ title: 'Detail Pesanan' }} />
      <Stack.Screen name="Wishlist" component={WishlistScreen} options={{ title: 'Favorit' }} />
      <Stack.Screen name="Addresses" component={AddressesScreen} options={{ title: 'Alamat Saya' }} />
      <Stack.Screen name="AddressForm" component={AddressFormScreen} options={{ title: 'Alamat' }} />
      <Stack.Screen name="EditProfile" component={EditProfileScreen} options={{ title: 'Ubah Profil' }} />
      <Stack.Screen name="MyStore" component={MyStoreScreen} options={{ title: 'Toko Saya' }} />
      <Stack.Screen name="StoreForm" component={StoreFormScreen} options={{ title: 'Toko' }} />
      <Stack.Screen name="ProductForm" component={ProductFormScreen} options={{ title: 'Produk' }} />
      <Stack.Screen name="Promos" component={PromosScreen} options={{ title: 'Promo & Voucher' }} />
    </Stack.Navigator>
  );
}
