import React, { Component } from 'react';
import {
  AppRegistry,
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  DeviceEventEmitter,
  Image
} from 'react-native';

import { StackNavigator, TabNavigator, TabView } from 'react-navigation';

import SmartLockerView from './SmartLocker';
import EquipmentList from './EquipmentList';
import CheckOuts from './CheckOuts';


console.disableYellowBox = true;



const EquipmentStack = StackNavigator({
  EquipmentList: { screen: EquipmentList }
}, {
    headerMode: 'screen'
});

const CheckOutsStack = StackNavigator({
  CheckOuts: { screen: CheckOuts }
}, {
    headerMode: 'screen'
});



const MyTabs = TabNavigator({
  SmartLocker: {
    screen: SmartLockerView
  },
  Equipment: {
    screen: EquipmentStack,
  },
  CheckOuts: {
    screen: CheckOutsStack
  }
}, {
  tabBarPosition: 'bottom',
  tabBarComponent: TabView.TabBarBottom,
  swipeEnabled: false,
  animationEnabled: false,
  backBehavior: 'none',
  showIcon: true,
  // inactiveTintColor: backgroundColors.navActive,
  // activeTintColor: backgroundColors.nav,
  tabBarOptions: {
    showLabel: false,
    // showIcon: true,
    activeBackgroundColor: '#1144aa',
    inactiveBackgroundColor: '#0066cc',
    activeTintColor: '#1144aa',
    inactiveTintColor: '#0066cc',

    // pressColor: Colors.redColor,
    // indicatorStyle: { backgroundColor: Colors.redColor },
    // style: {
      // backgroundColor: Colors.whiteColor
    // }
  }
});





export default class App extends Component {

  render() {
    return (
      <View style={{flex: 1}}>
        <MyTabs />
      </View>
    )
  }

}


AppRegistry.registerComponent('SmartLocker', () => SmartLocker);
