import React, { Component } from 'react';

import './App.css';
import {create} from 'apisauce'

class App extends Component {

  constructor(props){
    super(props)
    var previousState = JSON.parse(localStorage.getItem('github-repo-data'))
    if(previousState)
      this.state = previousState
    else
      this.state={
        repoName:null,
        searching:false,
        repos:[]
      }
  }

  searchRepo(){
    const { repoName } = this.state
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

         create({
                baseURL: `https://api.github.com`,
                 headers: {'Accept':'application/vnd.github.cloak-preview'}
              }).get(`/search/repositories`,{
                q:`topic:${repoName.trim()}`,
              })
              .then( handleResponse)
              .catch(handleResponse);
  }

  render() {
    localStorage.setItem('github-repo-data',JSON.stringify(this.state))
    const { repoName,searching,repos } = this.state
    const isValid = repoName!==null&&repoName.trim().length>0
    return (
      <div className="App">
            <form onSubmit={(e)=> {
                  e.preventDefault();
                    this.searchRepo()
                  } }>   
              
               <div className="element-container">
                        <h1>Github Repo Search</h1>                
                       <input name="repoName" type="text" placeholder="Type Repo Name" required value={repoName||''} onChange={(e) =>
                        { 
                          var newrepoName  = e.target.value
                          this.setState((prevState)=> {
                            return {...prevState,repoName:newrepoName,repos:[]}
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
