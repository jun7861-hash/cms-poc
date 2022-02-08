import { createStore, combineReducers } from "redux";
import { masterReducer } from "./master/reducer";
import { userReducer } from "./user/reducer";
import { toolsReducer } from "./tools/reducer";
import { articleReducer } from "./article/reducer";
import { composeWithDevTools } from 'redux-devtools-extension';


const rootReducer = combineReducers({
  user: userReducer,
  master: masterReducer,
  tools: toolsReducer,
  article: articleReducer
})

const store = createStore(rootReducer, composeWithDevTools());

export default store