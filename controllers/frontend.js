module.exports = function(context) {

    // Imports
    let proteinsDao = context.component('daos').module('proteins');

    return {
        about: function(request, response) {
            return response.render('about', {
                title: 'About'
            });
        },
        maps: function(request, response) {
            return context.gridFs.files.find().toArray(function (err, files) {
                if (err) {
                    return response.render('error', {
                        title: 'Error',
                        message: "Unable to retrieve maps metadata",
                        error: error
                    });
                }
                return response.render('maps', {
                    title: 'Maps',
                    maps: files
                });
            })
        },
        map: function(request, response) {
            const imageId = request.params.iid;
            const proteins = (function(){
                if (request.query.p !== undefined){
                    if (request.query.p.constructor === Array){
                        return request.query.p
                    } else {
                        return [request.query.p]
                    }
                } else {
                    return undefined;
                }
            })();

            if(imageId !== undefined){
                return proteinsDao.findProteins(proteins).then(function(requestProteins){
                    return response.render('map', {
                        title: 'Protein interaction visualizer',
                        iid: imageId,
                        requestProteins: requestProteins,
                        localizations: context.constants.localizations
                    });
                },function(error){
                    return response.render('error', {
                        title: 'Error',
                        message: "Unable to retrieve images metadata",
                        error: error
                    });
                });
            } else if(request.user && request.user.map){
                return response.redirect('/map/' + request.user.map + (proteins !== undefined ? "?p=" + proteins.join('&p=') : '' ));
            } else {
                return context.gridFs.findOne({},function(error, element){
                    if(error){
                        return response.status(500).render('error', {
                            title: '500',
                            message: "Cannot retrieve an image",
                            error: error
                        });
                    } else if(element === null){
                        return response.status(404).render('404', {
                            title: '404',
                            message: "Cannot retrieve an image",
                            error: error
                        });
                    } else {
                        return response.redirect('/map/' + element._id + (proteins !== undefined ? "?p=" + proteins.join('&p=') : '' ));
                    }
                });
            }
        },
        error: function(request, response) {
            return response.render('error', {
                title: 'Error',
                message: "There was an unknown error with your request.",
                error: "There was an unknown error with your request."
            });
        },
        ppi: async function(request, response) {
            const imageId = request.params.iid;
            const partners = request.query.partners;
            let proteins = (function(){
                if (request.query.p !== undefined){
                    if (request.query.p.constructor === Array){
                        return request.query.p
                    } else {
                        return [request.query.p]
                    }
                } else {
                    return undefined;
                }
            })();

            // If no image/map is defined, select the user's preferred image OR the first image in the images list
            if(imageId === undefined){
                if(request.user && request.user.map){
                    return response.redirect('/ppi/' + request.user.map + (proteins !== undefined ? "?p=" + proteins.join('&p=') : '' ) + (proteins && partners !== undefined ? "&partners=true" : '' ));
                } else {
                    return context.gridFs.findOne({},function(error, element){
                        if(error){
                            return response.status(500).render('error', {
                                title: '500',
                                message: "Cannot retrieve an image",
                                error: error
                            });
                        } else if(element === null){
                            return response.status(404).render('404', {
                                title: '404',
                                message: "Cannot retrieve an image",
                                error: error
                            });
                        } else {
                            return response.redirect('/ppi/' + element._id + (proteins !== undefined ? "?p=" + proteins.join('&p=') : '' ) + (proteins && partners !== undefined ? "&partners=true" : '' ));
                        }
                    });
                }
            }

            // If "partners" is passed in the query, load the partners of the FIRST protein. Add them to the "proteins" array, then render
            if(proteins !== undefined && partners !== undefined){
                try {
                    let protein = await proteinsDao.findByUniprotId(proteins[0]);

                    if(protein !== null){
                        proteins = [...proteins, ...protein.interactions.partners.map(partner => partner.interactor)]
                    }
                } catch (e){
                    console.error(e);
                }

            }

            return proteinsDao.findProteins(proteins.slice(0, 400)).then(function(requestProteins){
                return response.render('ppi', {
                    title: 'Protein interaction visualizer',
                    iid: imageId,
                    requestProteins: requestProteins,
                    localizations: context.constants.localizations,
                    root: partners !== undefined ? proteins[0] : undefined
                });
            }, function(error){
                return response.render('error', {
                    title: 'Error',
                    message: "Unable to retrieve images metadata",
                    error: error
                });
            });

        },
        editor: function(request, response) {
            const imageId = request.params.iid;
            return response.render('editor', {
                title: 'Protein interaction visualizer',
                iid: imageId,
                localizations: context.constants.localizations
            });
        },
        legend: function(request, response) {
            return response.render('legend', {
                title: 'Color legend',
                localizations: context.constants.localizations
            });
        },
        search: function(request, response) {

            // Standardize query element: Either undefined or array.
            const query = (function(){
                if (request.query.q !== undefined){
                    if (request.query.q.constructor === Array){
                        return request.query.q
                    } else {
                        return [request.query.q]
                    }
                } else {
                    return undefined;
                }
            })();

            if(query !== undefined && query.length > 0 && query[0].length > 1){
                // !!! ONLY TAKE FIRST ELEMENT OF QUERY!
                const queryString = query[0].toUpperCase();
                proteinsDao.findProteinNames(queryString).then(function(proteins){
                    return response.render('search', {
                        title: 'Search for proteins',
                        localizations: context.constants.localizations,
                        proteins: proteins
                    });
                }, function(error){
                    return response.status(500).render('error', {
                        title: '500',
                        message: "Cannot retrieve proteins",
                        error: error
                    });
                });
            } else {
                return response.render('search', {
                    title: 'Search for proteins',
                    localizations: context.constants.localizations
                });
            }
        },

        protein: function(request, response) {
            const uniprotId = request.params.uniprotId;

            return proteinsDao.findByUniprotId(uniprotId)
                .then(function(requestProtein){
                    if(requestProtein) {
                        return proteinsDao.getPartners(requestProtein).then(function(partners){
                            return response.render('protein', {
                                title: uniprotId,
                                localizations: context.constants.localizations,
                                protein: requestProtein,
                                partners: partners
                            });
                        }, function(error){
                            return response.render('error', {
                                title: 'Error',
                                message: "Unable to retrieve protein interacitons data",
                                error: error
                            });
                        });
                    } else {
                        return response.render('404', {
                            title: 'No protein',
                            message: "No protein with UniProt accession '" + uniprotId + "'.",
                            error: "No protein by that name"
                        });
                    }

                })
                .catch(function(error){
                    return response.render('error', {
                        title: 'Error',
                        message: "Unable to retrieve protein data",
                        error: error
                    });
                });

        }
    }
}