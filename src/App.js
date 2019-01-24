import React, { Component } from 'react';

import './App.css';
import {create} from 'apisauce'

const SearchTypes = {
  Name:1,
  Topic:2,
  Login:3,
  ReadMe:4
}

class App extends Component {

  constructor(props){
    super(props)
    var previousState = JSON.parse(localStorage.getItem('github-repo-data'))
    if(previousState)
      this.state = previousState
    else
      this.state={
        query:null,
        searching:false,
        repos:[],
        searchType:SearchTypes.Name
      }
  }

  searchRepo(){
    const { query,searchType } = this.state
     this.setState((prevState)=> {
                            return {...prevState,
                                    searching:true,
                                    repos:[]
                                  }
                      })

     let ctrl = this
      const handleResponse = (res,options)=>{
          ctrl.setState((prevState)=> {
                    return {...prevState,
                            searching:false
                          }
              })
        if(res === null||
            res.status===null||
              res.status!==200||
              res.data===null||
                 (Array.isArray(res.data)&&res.data.length===0)){
               ctrl.setState((prevState)=> {
                    return {...prevState,
                            searching:false
                          }
              })
            return
        }

       ctrl.setState((prevState)=> {
                return {...prevState,
                        searching:false,
                        repos:res.data.items!==null?res.data.items:[]
                      }
          })               
     }
     var qType = 'name'
     switch(searchType){
       case SearchTypes.Topic:
          qType = 'topic';
          break
       case SearchTypes.Login:
          qType = 'user';
          break;
        case SearchTypes.ReadMe:
          qType = 'readme';
          break;
     }
     create({
                baseURL: `https://api.github.com`,
                 headers: {'Accept':'application/vnd.github.cloak-preview'}
              }).get(`/search/repositories`,{
                q:`${qType}:${query.trim()}`,
              })
              .then( handleResponse)
              .catch(handleResponse);
  }

  render() {
    localStorage.setItem('github-repo-data',JSON.stringify(this.state))
    const { query,searching,repos,searchType } = this.state
    const isValid = query!==null&&query!==undefined&&query.trim().length>0
    const type = searchType !== null ? searchType : SearchTypes.Name
    return (
      <div className="App">
              <div className="menu">
                <a href onClick={() =>  this.setState((prevState)=> {
                            return {...prevState,searchType:SearchTypes.Name,repos:[]}
                      })} className={type===SearchTypes.Name ? 'active' : ''}>Name</a>
                <a href onClick={() =>  this.setState((prevState)=> {
                            return {...prevState,searchType:SearchTypes.Topic,repos:[]}
                      })} className={type===SearchTypes.Topic ? 'active' : ''}>Topic</a>
                <a href onClick={() =>  this.setState((prevState)=> {
                            return {...prevState,searchType:SearchTypes.Login,repos:[]}
                      })} className={type===SearchTypes.Login ? 'active' : ''}>Username</a>
                <a href onClick={() =>  this.setState((prevState)=> {
                            return {...prevState,searchType:SearchTypes.ReadMe,repos:[]}
                      })} className={type===SearchTypes.ReadMe ? 'active' : ''}>ReadMe</a>
            </div>
            <form onSubmit={(e)=> {
                  e.preventDefault();
                    this.searchRepo()
                  } }>   
              
               <div className="element-container">
                        <h1>Github Repo Search</h1>                
                       <input name="query" type="text" placeholder="Type query" required value={query||''} onChange={(e) =>
                        { 
                          var newquery  = e.target.value
                          this.setState((prevState)=> {
                            return {...prevState,query:newquery,repos:[]}
                      })}} />   
                     </div>

                  <div className="element-container">
              
                     <div className="text-center">
                     {
                        searching===false&&isValid&&(<button disabled={!isValid} onClick={() => isValid&&this.searchRepo()}>Search</button>)
                      }
                      {
                        searching&&(<div><label>Searching ...</label></div>)
                      }
                     </div>
                    </div>
                    <ul>
                  {
                        repos&&repos.length>0&&!searching&&
                          repos.map((repo,index)=>{
                              return (<li key={index} onClick={(e) =>{  var win = window.open(repo.html_url, '_blank');win.focus(); }}>
                                <div className="repo-row">
                                  <div className="text-center">
                                    <img src={repo.owner.avatar_url} onError={(e)=>{e.target.src = null }} alt={repo.name} className="repo-row-image"/>
                                    <div className="repo-row-login">{repo.owner.login}</div>
                                  </div>
                                  <div className="repo-row-details">
                                    <div className="repo-row-name">
                                      {repo.name} 
                                    </div>  
                                     <div className="repo-row-description">
                                      {repo.description}
                                    </div>
                                    <div className="repo-row-language">
                                      {repo.language}
                                    </div>
                                  </div>       
                                </div>
                              </li>)
                              })                    
                  }
            </ul>
              </form>
      </div>
    );
  }
}

export default App;
